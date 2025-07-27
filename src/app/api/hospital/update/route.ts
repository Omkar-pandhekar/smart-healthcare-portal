import { ConnectDB } from "@/dbConfig/dbConfig";
import Hospital from "@/models/hospital.model";
import User from "@/models/user.models";
import { NextRequest, NextResponse } from "next/server";

const MAPBOX_API_KEY = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

type Address = {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  location?: { type: string; coordinates: [number, number] };
};

async function getCoordinatesFromAddress(address: Address) {
  if (!MAPBOX_API_KEY) return null;
  const query = encodeURIComponent(
    [
      address.street,
      address.city,
      address.state,
      address.country,
      address.postalCode,
    ]
      .filter(Boolean)
      .join(", ")
  );
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${MAPBOX_API_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.features && data.features.length > 0) {
      // Mapbox returns [lng, lat]
      return data.features[0].center;
    }
  } catch (e) {
    console.error("Mapbox geocoding error:", e);
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    await ConnectDB();
    const reqBody = await request.json();
    const { email, name, phone, website, address, images } = reqBody;
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    // Prepare address and coordinates
    const addressObj = address || {};
    let coordinates =
      addressObj.location && Array.isArray(addressObj.location.coordinates)
        ? addressObj.location.coordinates
        : null;
    // If coordinates are not provided, use Mapbox to geocode
    if (!coordinates || (coordinates[0] === 0 && coordinates[1] === 0)) {
      const geo = await getCoordinatesFromAddress(addressObj);
      if (geo) {
        coordinates = geo;
      } else {
        coordinates = [0, 0];
      }
    }
    addressObj.location = {
      type: "Point",
      coordinates,
    };
    // Check if hospital exists
    let hospital = await Hospital.findOne({ email });
    if (hospital) {
      hospital.name = name ?? hospital.name;
      hospital.phone = phone ?? hospital.phone;
      hospital.website = website ?? hospital.website;
      hospital.address = address ?? hospital.address;
      if (images !== undefined) hospital.images = images;
      await hospital.save();
    } else {
      let hospitalPassword = undefined;
      const user = await User.findOne({ email });
      if (user) hospitalPassword = user.password;
      hospital = await Hospital.create({
        name,
        email,
        phone,
        website,
        address,
        images: images || [],
        password: hospitalPassword || "changeme", // fallback if not found
      });
    }
    // Exclude password from response
    const hospitalObj = hospital.toObject();
    delete hospitalObj.password;
    return NextResponse.json({
      message: "Hospital info saved successfully",
      success: true,
      hospital: hospitalObj,
    });
  } catch (error) {
    console.error("Hospital Update API error:", error);
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
