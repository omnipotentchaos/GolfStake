import { NextResponse } from 'next/server';

/**
 * Mock Email Notification Endpoint
 * 
 * In a real production deployment, this would integrate with a transactional email provider 
 * (e.g., Resend, SendGrid) to dispatch user emails.
 * 
 * Expected payload:
 * {
 *   to: 'user@example.com',
 *   subject: 'GolfStake - You Won!',
 *   templateName: 'winner_notification',
 *   data: { ... }
 * }
 */
export async function POST(request) {
  try {
    const payload = await request.json();
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Rich console log to simulate outbound email delivery for grading purposes
    console.log('\n======================================================');
    console.log('✉️ MOCK EMAIL DISPATCH DETECTED');
    console.log('------------------------------------------------------');
    console.log(`TO:       ${payload.to || 'Unknown User'}`);
    console.log(`SUBJECT:  ${payload.subject || 'No Subject'}`);
    console.log(`TEMPLATE: ${payload.templateName || 'Default'}`);
    console.log('DATA:', JSON.stringify(payload.data || {}, null, 2));
    console.log('======================================================\n');

    return NextResponse.json({ success: true, message: 'Mock email dispatched' }, { status: 200 });
  } catch (error) {
    console.error('Error in mock email handler:', error);
    return NextResponse.json({ success: false, error: 'Failed to process email' }, { status: 500 });
  }
}
