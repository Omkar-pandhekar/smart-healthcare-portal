import { ConnectDB } from "@/dbConfig/dbConfig";
import Doctor from "@/models/Doctor.model";
import User from "@/models/user.models";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Connect to database first
    await ConnectDB();

    const reqBody = await request.json();
    const {
      email,
      name,
      specialization,
      qualifications,
      experience,
      languages,
      gender,
      profileImage,
      consultationFees,
      password, // may or may not be present
      hospital,
      verificationStatus,
    } = reqBody;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    let doctor = await Doctor.findOne({ email });
    if (doctor) {
      // Update existing doctor
      doctor.name = name ?? doctor.name;
      doctor.specialization = specialization ?? doctor.specialization;
      doctor.qualifications = qualifications ?? doctor.qualifications;
      doctor.experience = experience ?? doctor.experience;
      doctor.languages = Array.isArray(languages)
        ? languages
        : languages
        ? [languages]
        : doctor.languages;
      doctor.gender = gender ?? doctor.gender;
      doctor.profileImage = profileImage ?? doctor.profileImage;
      doctor.consultationFees = consultationFees ?? doctor.consultationFees;
      if (hospital !== undefined) doctor.hospital = hospital;
      if (verificationStatus !== undefined)
        doctor.verificationStatus = verificationStatus;
      await doctor.save();
    } else {
      // Get password from user model if not provided
      let doctorPassword = password;
      if (!doctorPassword) {
        const user = await User.findOne({ email });
        if (!user) {
          return NextResponse.json(
            { error: "User not found for doctor password" },
            { status: 404 }
          );
        }
        doctorPassword = user.password;
      }
      // Create new doctor
      doctor = await Doctor.create({
        email,
        name,
        specialization,
        qualifications,
        experience,
        languages: Array.isArray(languages)
          ? languages
          : languages
          ? [languages]
          : [],
        gender,
        profileImage,
        consultationFees,
        password: doctorPassword,
        hospital,
        verificationStatus,
      });
    }

    // Exclude password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...doctorWithoutPassword } = doctor.toObject();

    return NextResponse.json({
      message: "Doctor info saved successfully",
      success: true,
      doctor: doctorWithoutPassword,
    });
  } catch (error) {
    console.error("Doctor Update API error:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
