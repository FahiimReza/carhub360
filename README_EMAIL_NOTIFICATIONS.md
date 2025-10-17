# Email Notification System for CarHub360

This document explains how to configure and use the email notification system that sends alerts to admin Gmail accounts when users book cars or send messages.

## Overview

The email notification system automatically sends professional HTML emails to administrators when:
- A new car booking is created
- A new message is received from a user
- A new user registers for an account
- A new service booking is created

## Configuration

### 1. Gmail Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "CarHub360"
   - Copy the 16-character password

### 2. Environment Variables

Update your `.env` file with the following configuration:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_app_password
ADMIN_EMAIL=admin@carhub360.com
```

**Important Notes:**
- `EMAIL_USER`: Your Gmail address
- `EMAIL_PASS`: The 16-character app password (not your regular password)
- `ADMIN_EMAIL`: Where notifications should be sent (can be same as EMAIL_USER)

## Email Templates

### Booking Notification Email

Includes:
- Booking reference number
- Customer information (name, email, phone)
- Car details (brand, model, variant, year)
- Booking dates and duration
- Total amount
- Special requests (if any)
- Direct link to admin panel

### Message Notification Email

Includes:
- Message subject
- Customer information (name, email, phone)
- Message content
- Conversation ID
- Direct link to admin panel

### User Registration Notification Email

Includes:
- User information (name, email, phone)
- User ID and registration date
- Account type/role
- Direct links to admin panel for user management
- User growth metrics

### Service Booking Notification Email

Includes:
- Service details (name, category, price)
- Booking reference number
- Scheduled date and time
- Customer information (name, email, phone)
- Service location (if provided)
- Customer notes (if provided)
- Direct links to admin panel for booking management
- Service revenue analytics

## Testing the System

### Run Email Tests

```bash
node test_email.js
```

This will test:
1. Email configuration validity
2. Sample booking notification
3. Sample message notification

### Run Registration Email Test

```bash
node test_registration_email.js
```

This will test:
1. Sample user registration notification

### Run Service Booking Email Test

```bash
node test_service_booking_email.js
```

This will test:
1. Sample service booking notification

### Manual Testing

1. Create a test booking through the application
2. Send a test message through the contact form
3. Check the admin email for notifications

## File Structure

```
utils/emailService.js     # Main email service module
routes/bookings.js        # Modified to send booking notifications
routes/messages.js        # Modified to send message notifications
routes/users.js           # Modified to send registration notifications
routes/services.js        # Modified to send service booking notifications
test_email.js            # Email testing utility
test_registration_email.js # Registration email testing utility
test_service_booking_email.js # Service booking email testing utility
.env                     # Email configuration
```

## Error Handling

- Email sending is asynchronous and won't block the booking/message creation process
- Errors are logged to the console but don't affect user experience
- System gracefully handles missing email configuration

## Security Considerations

1. **Never commit real email credentials to version control**
2. **Use App Passwords instead of regular Gmail passwords**
3. **Keep your .env file secure and out of public repositories**
4. **Consider using environment-specific configurations**

## Troubleshooting

### Common Issues

1. **"Invalid login" error**
   - Check that you're using an App Password, not your regular password
   - Ensure 2-Factor Authentication is enabled on your Gmail account

2. **"Greeting never received" error**
   - Check your internet connection
   - Verify Gmail SMTP settings
   - Try restarting the server

3. **Emails not sending**
   - Check console logs for error messages
   - Verify environment variables are loaded correctly
   - Run `node test_email.js` to diagnose issues

### Debug Mode

Add this to your `.env` for detailed logging:
```env
NODE_ENV=development
```

## Customization

### Modify Email Templates

Edit `utils/emailService.js` to customize:
- Email styling and layout
- Information included in notifications
- Admin panel links
- Company branding

### Add New Notification Types

1. Create new email functions in `utils/emailService.js`
2. Import and use them in your route handlers
3. Follow the same async pattern to avoid blocking operations

### Registration Email Template

The registration email template includes:
- Modern gradient header with user theme
- User profile information card
- Welcome message with user access privileges
- Quick action buttons for admin
- User growth metrics
- Responsive design with mobile support

Key features:
- Automatically sent when a new user registers
- Includes direct links to admin panel
- Shows user contact information for quick follow-up
- Displays user growth metrics for business insights

### Service Booking Email Template

The service booking email template includes:
- Modern gradient header with service theme
- Service details information card
- Customer information card
- Service location and notes (if provided)
- Quick action buttons for admin
- Service revenue analytics
- Responsive design with mobile support

Key features:
- Automatically sent when a new service is booked
- Includes direct links to admin panel
- Shows service details and customer information
- Displays service revenue metrics
- Provides quick action buttons for customer contact

## Production Deployment

For production environments:

1. Use a dedicated email service (SendGrid, Mailgun, etc.) for better deliverability
2. Set up email logging and monitoring
3. Configure email queue system for high-volume applications
4. Consider implementing email analytics

## Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify your Gmail App Password is correct
3. Ensure all required environment variables are set
4. Run the test utility to diagnose problems