import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    // TODO: Replace with your actual email service
    // Option 1: Resend (recommended for developers)
    // await resend.emails.send({ ... })
    
    // Option 2: Mailchimp API
    // await mailchimp.lists.addListMember(... )
    
    // Option 3: Simple file-based storage (for MVP)
    const fs = await import("fs/promises");
    const path = await import("path");
    const dataFile = path.join(process.cwd(), "data", "waitlist.json");
    
    await fs.mkdir(path.join(process.cwd(), "data"), { recursive: true });
    
    let emails: string[] = [];
    try {
      const existing = await fs.readFile(dataFile, "utf-8");
      emails = JSON.parse(existing);
    } catch {}
    
    if (emails.includes(email)) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    
    emails.push(email);
    await fs.writeFile(dataFile, JSON.stringify(emails, null, 2));

    return NextResponse.json({ 
      success: true, 
      message: "You're on the list!" 
    });
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}