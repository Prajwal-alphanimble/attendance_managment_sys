import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env.local');
  }

  // Get the headers
  const headerPayload = request.headers;
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Error occurred -- no svix headers' }, { status: 400 });
  }

  // Get the body
  const payload = await request.text();
  const body = JSON.parse(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(webhookSecret);

  let evt: any;

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json({ error: 'Error occurred' }, { status: 400 });
  }

  // Handle the webhook
  const eventType = evt.type;
  
  try {
    await connectDB();

    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name } = evt.data;
      
      const email = email_addresses[0]?.email_address;
      
      if (!email) {
        return NextResponse.json({ error: 'No email found' }, { status: 400 });
      }

      // Check if user already exists
      let user = await User.findOne({ clerkId: id });

      if (user) {
        // Update existing user
        user.email = email;
        user.firstName = first_name || user.firstName;
        user.lastName = last_name || user.lastName;
        await user.save();
      } else {
        // Create new user
        user = new User({
          clerkId: id,
          email,
          firstName: first_name,
          lastName: last_name,
          role: 'employee', // Default role
        });
        await user.save();
      }

      console.log(`User ${eventType}:`, user);
    } else if (eventType === 'user.deleted') {
      const { id } = evt.data;
      
      await User.findOneAndDelete({ clerkId: id });
      console.log(`User deleted: ${id}`);
    }

    return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
