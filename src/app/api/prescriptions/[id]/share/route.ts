import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ConnectDB } from "../../../../../dbConfig/dbConfig";
import Prescription from "../../../../../models/Prescription.model";
import User from "../../../../../models/user.models";
import Doctor from "../../../../../models/Doctor.model";
import { authOptions } from "../../../../../utils/authOptions";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ConnectDB();

    // Await params for Next.js 15+
    const { id } = await params;

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const prescription = await Prescription.findById(id);

    if (!prescription) {
      return NextResponse.json(
        { success: false, error: "Prescription not found" },
        { status: 404 }
      );
    }

    // Authorization check
    const doctor = await Doctor.findOne({ email: session.user.email });
    const user = await User.findOne({ email: session.user.email });

    if (doctor) {
      if (prescription.doctorId.toString() !== doctor._id.toString()) {
        return NextResponse.json(
          { success: false, error: "Access denied" },
          { status: 403 }
        );
      }
    } else if (user) {
      if (prescription.patientId.toString() !== user._id.toString()) {
        return NextResponse.json(
          { success: false, error: "Access denied" },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    // Generate PDF
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { width, height } = page.getSize();

    // Load fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let yPosition = height - 50;

    // Header
    page.drawText("PRESCRIPTION", {
      x: 50,
      y: yPosition,
      size: 24,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    yPosition -= 40;

    // Patient Information
    page.drawText("Patient Information:", {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    yPosition -= 20;
    page.drawText(
      `Name: ${
        typeof prescription.patientId === "object"
          ? prescription.patientId.fullname
          : "Patient ID: " + prescription.patientId
      }`,
      {
        x: 50,
        y: yPosition,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      }
    );

    yPosition -= 15;
    page.drawText(
      `Email: ${
        typeof prescription.patientId === "object"
          ? prescription.patientId.email
          : "Not available"
      }`,
      {
        x: 50,
        y: yPosition,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      }
    );

    yPosition -= 30;

    // Doctor Information
    page.drawText("Prescribed By:", {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    yPosition -= 20;
    page.drawText(
      `Dr. ${
        typeof prescription.doctorId === "object"
          ? prescription.doctorId.name
          : "Doctor ID: " + prescription.doctorId
      }`,
      {
        x: 50,
        y: yPosition,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      }
    );

    yPosition -= 15;
    page.drawText(
      `Specialization: ${
        typeof prescription.doctorId === "object"
          ? prescription.doctorId.specialization
          : "Not available"
      }`,
      {
        x: 50,
        y: yPosition,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      }
    );

    yPosition -= 30;

    // Prescription Details
    page.drawText("Prescription Details:", {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    yPosition -= 20;
    page.drawText(
      `Date: ${new Date(prescription.createdAt).toLocaleDateString()}`,
      {
        x: 50,
        y: yPosition,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      }
    );

    yPosition -= 15;
    page.drawText(`Status: ${prescription.status}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });

    if (prescription.followUpDate) {
      yPosition -= 15;
      page.drawText(
        `Follow-up Date: ${new Date(
          prescription.followUpDate
        ).toLocaleDateString()}`,
        {
          x: 50,
          y: yPosition,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        }
      );
    }

    yPosition -= 30;

    // Medications
    page.drawText("Medications:", {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    yPosition -= 20;

    prescription.medications.forEach((medication: any, index: number) => {
      if (yPosition < 100) {
        // Add new page if running out of space
        page = pdfDoc.addPage([595.28, 841.89]);
        yPosition = height - 50;
      }

      page.drawText(`${index + 1}. ${medication.name}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      yPosition -= 15;
      page.drawText(`   Dosage: ${medication.dosage}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      });

      yPosition -= 12;
      page.drawText(`   Frequency: ${medication.frequency}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      });

      yPosition -= 12;
      page.drawText(`   Duration: ${medication.duration}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      });

      if (medication.notes) {
        yPosition -= 12;
        page.drawText(`   Notes: ${medication.notes}`, {
          x: 50,
          y: yPosition,
          size: 10,
          font: font,
          color: rgb(0, 0, 0),
        });
      }

      yPosition -= 20;
    });

    // Notes
    if (prescription.notes) {
      yPosition -= 20;
      page.drawText("Notes:", {
        x: 50,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      yPosition -= 20;
      const words = prescription.notes.split(" ");
      let line = "";
      for (const word of words) {
        const testLine = line + word + " ";
        if (testLine.length > 80) {
          page.drawText(line, {
            x: 50,
            y: yPosition,
            size: 10,
            font: font,
            color: rgb(0, 0, 0),
          });
          yPosition -= 12;
          line = word + " ";
        } else {
          line = testLine;
        }
      }
      if (line) {
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: 10,
          font: font,
          color: rgb(0, 0, 0),
        });
      }
    }

    // Footer
    const lastPage = pdfDoc.getPages()[pdfDoc.getPageCount() - 1];
    lastPage.drawText(
      "This prescription is generated electronically and is valid for medical purposes.",
      {
        x: 50,
        y: 50,
        size: 8,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
      }
    );

    // Convert to buffer
    const pdfBytes = await pdfDoc.save();

    // Upload to S3
    const timestamp = Date.now();
    const fileName = `prescriptions/${id}-${timestamp}.pdf`;

    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: fileName,
      Body: pdfBytes,
      ContentType: "application/pdf",
    });

    await s3Client.send(uploadCommand);

    // Generate pre-signed URL (expires in 5 minutes)
    const signedUrl = await getSignedUrl(s3Client, uploadCommand, {
      expiresIn: 300,
    });

    return NextResponse.json({
      success: true,
      url: signedUrl,
    });
  } catch (error) {
    console.error("Generate prescription PDF error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
