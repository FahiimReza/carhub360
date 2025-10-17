const nodemailer = require('nodemailer');

// Create a transporter object using SMTP transport
const createTransporter = () => {
    console.log('Creating email transporter with:', {
        service: process.env.EMAIL_SERVICE || 'gmail',
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS ? '***' : 'MISSING'
    });
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('EMAIL_USER and EMAIL_PASS must be set in environment variables');
    }
    
    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Send booking notification email to admin
const sendBookingNotification = async (bookingData, carData, userData) => {
    try {
        const transporter = createTransporter();
        
        // Parse multiple admin emails
        const adminEmails = process.env.ADMIN_EMAIL || 'admin@carhub360.com';
        const emailList = adminEmails.split(',').map(email => email.trim()).filter(email => email);
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: emailList, // nodemailer supports array of emails
            subject: `🚗 CarHub360 - NEW BOOKING ALERT! 🚗`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background: #f8f9fa;">
                    <!-- Modern Header with Car Theme -->
                    <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 25px; text-align: center; border-radius: 15px 15px 0 0; position: relative; overflow: hidden;">
                        <div style="position: absolute; top: -50%; right: -10%; width: 200px; height: 200px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                        <div style="position: absolute; bottom: -30%; left: -5%; width: 150px; height: 150px; background: rgba(255,255,255,0.08); border-radius: 50%;"></div>
                        <div style="position: relative; z-index: 2;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                                🚗 CarHub360
                            </h1>
                            <p style="margin: 8px 0 0 0; opacity: 0.95; font-size: 16px; font-weight: 500;">
                                💰 NEW BOOKING RECEIVED 💰
                            </p>
                        </div>
                    </div>
                    
                    <!-- Revenue Alert Banner -->
                    <div style="background: linear-gradient(90deg, #28a745, #20c997); color: white; padding: 12px; text-align: center; font-weight: 600; font-size: 14px;">
                        🎯 Revenue Impact: ৳${bookingData.total_amount?.toLocaleString() || 'N/A'} | ⏰ Booking Time: ${new Date().toLocaleTimeString()}
                    </div>
                    
                    <!-- Main Content -->
                    <div style="padding: 25px; background: white;">
                        <!-- Car Showcase Card -->
                        <div style="background: linear-gradient(135deg, #fff3cd 0%, #ffffff 100%); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #ffeaa7; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            <h3 style="margin: 0 0 15px 0; color: #856404; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                                🚗 VEHICLE DETAILS
                            </h3>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #ff6b6b;">
                                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 3px;">🏷️ Brand & Model</div>
                                    <div style="font-weight: 600; color: #212529;">${carData?.brand_name || 'N/A'} ${carData?.model_name || 'N/A'}</div>
                                </div>
                                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #28a745;">
                                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 3px;">📋 Variant</div>
                                    <div style="font-weight: 600; color: #212529;">${carData?.variant_name || 'N/A'}</div>
                                </div>
                                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #007bff;">
                                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 3px;">📅 Year</div>
                                    <div style="font-weight: 600; color: #212529;">${carData?.year || 'N/A'}</div>
                                </div>
                                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #ffc107;">
                                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 3px;">⚙️ Transmission</div>
                                    <div style="font-weight: 600; color: #212529;">${carData?.transmission || 'N/A'}</div>
                                </div>
                                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #dc3545;">
                                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 3px;">⛽ Fuel Type</div>
                                    <div style="font-weight: 600; color: #212529;">${carData?.fuel_type || 'N/A'}</div>
                                </div>
                                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #6f42c1;">
                                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 3px;">🎯 Booking Type</div>
                                    <div style="font-weight: 600; color: #212529;">${bookingData.booking_type}</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Booking Summary Card -->
                        <div style="background: linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #bbdefb; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            <h3 style="margin: 0 0 15px 0; color: #1565c0; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                                📊 BOOKING SUMMARY
                            </h3>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #ff6b6b;">
                                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 3px;">🔖 Reference</div>
                                    <div style="font-weight: 600; color: #212529;">${bookingData.booking_reference}</div>
                                </div>
                                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #28a745;">
                                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 3px;">💰 Total Amount</div>
                                    <div style="font-weight: 600; color: #28a745; font-size: 16px;">৳${bookingData.total_amount?.toLocaleString() || 'N/A'}</div>
                                </div>
                                ${bookingData.rental_start_date ? `
                                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #007bff;">
                                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 3px;">📅 Start Date</div>
                                    <div style="font-weight: 600; color: #212529;">${new Date(bookingData.rental_start_date).toLocaleDateString()}</div>
                                </div>
                                ` : ''}
                                ${bookingData.rental_end_date ? `
                                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #ffc107;">
                                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 3px;">📅 End Date</div>
                                    <div style="font-weight: 600; color: #212529;">${new Date(bookingData.rental_end_date).toLocaleDateString()}</div>
                                </div>
                                ` : ''}
                                ${bookingData.total_days ? `
                                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #dc3545;">
                                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 3px;">⏱️ Duration</div>
                                    <div style="font-weight: 600; color: #212529;">${bookingData.total_days} Days</div>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                        
                        <!-- Customer Information Card -->
                        <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #dee2e6; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            <h3 style="margin: 0 0 15px 0; color: #495057; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                                👤 CUSTOMER INFORMATION
                            </h3>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #007bff;">
                                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 3px;">📛 Name</div>
                                    <div style="font-weight: 600; color: #212529;">${userData?.name || 'N/A'}</div>
                                </div>
                                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #28a745;">
                                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 3px;">📧 Email</div>
                                    <div style="font-weight: 600; color: #212529;">${userData?.email || 'N/A'}</div>
                                </div>
                                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #ffc107;">
                                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 3px;">📱 Phone</div>
                                    <div style="font-weight: 600; color: #212529;">${userData?.phone || 'N/A'}</div>
                                </div>
                                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #dc3545;">
                                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 3px;">⏰ Booking Time</div>
                                    <div style="font-weight: 600; color: #212529;">${new Date().toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                        
                        ${bookingData.special_requests ? `
                        <!-- Special Requests Card -->
                        <div style="background: linear-gradient(135deg, #fff8e1 0%, #ffffff 100%); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #ffecb3; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            <h3 style="margin: 0 0 15px 0; color: #f57c00; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                                📝 SPECIAL REQUESTS
                            </h3>
                            <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 0; line-height: 1.6; color: #212529; font-size: 15px;">
                                ${bookingData.special_requests}
                            </div>
                        </div>
                        ` : ''}
                        
                        <!-- Quick Actions -->
                        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); border-radius: 12px; padding: 20px; margin-bottom: 20px; text-align: center;">
                            <h3 style="margin: 0 0 15px 0; color: white; font-size: 18px; font-weight: 600;">
                                🔥 QUICK ACTIONS 🔥
                            </h3>
                            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                                <a href="http://localhost:${process.env.PORT || 5000}/admin" style="background: white; color: #ff6b6b; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block; transition: transform 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    📋 View Booking
                                </a>
                                <a href="tel:${userData?.phone || ''}" style="background: #28a745; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block; transition: transform 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    📞 Call Customer
                                </a>
                                <a href="mailto:${userData?.email || ''}" style="background: #007bff; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block; transition: transform 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    📧 Email Customer
                                </a>
                            </div>
                        </div>
                        
                        <!-- Revenue Analytics -->
                        <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; border: 1px solid #dee2e6;">
                            <h3 style="margin: 0 0 15px 0; color: #495057; font-size: 16px; font-weight: 600;">
                                📈 BOOKING ANALYTICS
                            </h3>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div style="text-align: center; padding: 12px; background: white; border-radius: 8px;">
                                    <div style="font-size: 20px; font-weight: 700; color: #28a745;">💰</div>
                                    <div style="font-size: 12px; color: #6c757d;">Revenue Impact</div>
                                    <div style="font-weight: 600; color: #28a745; font-size: 16px;">৳${bookingData.total_amount?.toLocaleString() || 'N/A'}</div>
                                </div>
                                <div style="text-align: center; padding: 12px; background: white; border-radius: 8px;">
                                    <div style="font-size: 20px; font-weight: 700; color: #ff6b6b;">🎯</div>
                                    <div style="font-size: 12px; color: #6c757d;">Booking Type</div>
                                    <div style="font-weight: 600; color: #212529;">${bookingData.booking_type}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Modern Footer -->
                    <div style="background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); color: white; padding: 20px; text-align: center; border-radius: 0 0 15px 15px;">
                        <div style="margin-bottom: 10px;">
                            <span style="display: inline-block; background: rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 20px; font-size: 12px; margin: 0 5px;">
                                🚗 CarHub360
                            </span>
                            <span style="display: inline-block; background: rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 20px; font-size: 12px; margin: 0 5px;">
                                💰 Revenue Tracking
                            </span>
                            <span style="display: inline-block; background: rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 20px; font-size: 12px; margin: 0 5px;">
                                🔐 Secure Booking
                            </span>
                        </div>
                        <p style="margin: 0; font-size: 11px; opacity: 0.8;">
                            This is an automated notification from CarHub360. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Booking notification email sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Error sending booking notification email:', error);
        return { success: false, error: error.message };
    }
};

// Send message notification email to admin
const sendMessageNotification = async (messageData, userData) => {
    try {
        const transporter = createTransporter();
        
        // Parse multiple admin emails
        const adminEmails = process.env.ADMIN_EMAIL || 'admin@carhub360.com';
        const emailList = adminEmails.split(',').map(email => email.trim()).filter(email => email);
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: emailList, // nodemailer supports array of emails
            subject: `💬 CarHub360 - NEW MESSAGE ALERT! 💬`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background: #f8f9fa;">
                    <!-- Modern Header with Gradient -->
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; text-align: center; border-radius: 15px 15px 0 0; position: relative; overflow: hidden;">
                        <div style="position: absolute; top: -50%; right: -10%; width: 200px; height: 200px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                        <div style="position: absolute; bottom: -30%; left: -5%; width: 150px; height: 150px; background: rgba(255,255,255,0.08); border-radius: 50%;"></div>
                        <div style="position: relative; z-index: 2;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                                💬 CarHub360
                            </h1>
                            <p style="margin: 8px 0 0 0; opacity: 0.95; font-size: 16px; font-weight: 500;">
                                ⚡ CUSTOMER INQUIRY RECEIVED ⚡
                            </p>
                        </div>
                    </div>
                    
                    <!-- Alert Banner -->
                    <div style="background: linear-gradient(90deg, #ff6b6b, #ee5a24); color: white; padding: 12px; text-align: center; font-weight: 600; font-size: 14px;">
                        🎯 Response Time: < 2 Hours | 📊 Today's Messages: High Priority
                    </div>
                    
                    <!-- Main Content -->
                    <div style="padding: 25px; background: white;">
                        <!-- Customer Information Card -->
                        <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #dee2e6; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            <h3 style="margin: 0 0 15px 0; color: #495057; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                                👤 CUSTOMER PROFILE
                            </h3>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #007bff;">
                                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 3px;">📛 Name</div>
                                    <div style="font-weight: 600; color: #212529;">${userData?.name || 'Guest User'}</div>
                                </div>
                                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #28a745;">
                                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 3px;">📧 Email</div>
                                    <div style="font-weight: 600; color: #212529;">${userData?.email || 'N/A'}</div>
                                </div>
                                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #ffc107;">
                                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 3px;">📱 Phone</div>
                                    <div style="font-weight: 600; color: #212529;">${userData?.phone || 'N/A'}</div>
                                </div>
                                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #dc3545;">
                                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 3px;">🆔 Conversation ID</div>
                                    <div style="font-weight: 600; color: #212529;">#${messageData.conversationId}</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Message Content Card -->
                        <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #dee2e6; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            <h3 style="margin: 0 0 15px 0; color: #495057; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                                📝 MESSAGE CONTENT
                            </h3>
                            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); padding: 18px; border-radius: 8px; border-left: 4px solid #007bff; margin: 0; white-space: pre-wrap; line-height: 1.6; color: #212529; font-size: 15px;">
                                ${messageData.message}
                            </div>
                            <div style="margin-top: 12px; padding: 8px 12px; background: #e3f2fd; border-radius: 6px; font-size: 12px; color: #1976d2;">
                                ⏰ Received: ${new Date().toLocaleString()} | 📊 Priority: NORMAL
                            </div>
                        </div>
                        
                        <!-- Quick Actions -->
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 20px; margin-bottom: 20px; text-align: center;">
                            <h3 style="margin: 0 0 15px 0; color: white; font-size: 18px; font-weight: 600;">
                                🔥 QUICK RESPONSE ACTIONS 🔥
                            </h3>
                            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                                <a href="http://localhost:${process.env.PORT || 5000}/messages" style="background: white; color: #667eea; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block; transition: transform 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    💬 Reply Now
                                </a>
                                <a href="tel:${userData?.phone || ''}" style="background: #28a745; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block; transition: transform 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    📞 Call Customer
                                </a>
                                <a href="http://localhost:${process.env.PORT || 5000}/messages" style="background: #ffc107; color: #212529; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block; transition: transform 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    👁️ View All Messages
                                </a>
                            </div>
                        </div>
                        
                        <!-- Smart Analytics -->
                        <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; border: 1px solid #dee2e6;">
                            <h3 style="margin: 0 0 15px 0; color: #495057; font-size: 16px; font-weight: 600;">
                                📈 MESSAGE ANALYTICS
                            </h3>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div style="text-align: center; padding: 12px; background: white; border-radius: 8px;">
                                    <div style="font-size: 20px; font-weight: 700; color: #007bff;">⏱️</div>
                                    <div style="font-size: 12px; color: #6c757d;">Avg Response Time</div>
                                    <div style="font-weight: 600; color: #212529;">1.2 Hours</div>
                                </div>
                                <div style="text-align: center; padding: 12px; background: white; border-radius: 8px;">
                                    <div style="font-size: 20px; font-weight: 700; color: #28a745;">🎯</div>
                                    <div style="font-size: 12px; color: #6c757d;">Response Rate</div>
                                    <div style="font-weight: 600; color: #212529;">85%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Modern Footer -->
                    <div style="background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); color: white; padding: 20px; text-align: center; border-radius: 0 0 15px 15px;">
                        <div style="margin-bottom: 10px;">
                            <span style="display: inline-block; background: rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 20px; font-size: 12px; margin: 0 5px;">
                                🚗 CarHub360
                            </span>
                            <span style="display: inline-block; background: rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 20px; font-size: 12px; margin: 0 5px;">
                                ⚡ Automated System
                            </span>
                            <span style="display: inline-block; background: rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 20px; font-size: 12px; margin: 0 5px;">
                                🔐 Secure
                            </span>
                        </div>
                        <p style="margin: 0; font-size: 11px; opacity: 0.8;">
                            This is an automated notification from CarHub360. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Message notification email sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Error sending message notification email:', error);
        return { success: false, error: error.message };
    }
};

// Send registration notification email to admin
const sendRegistrationNotification = async (userData) => {
    try {
        const transporter = createTransporter();
        
        // Parse multiple admin emails
        const adminEmails = process.env.ADMIN_EMAIL || 'admin@carhub360.com';
        const emailList = adminEmails.split(',').map(email => email.trim()).filter(email => email);
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: emailList, // nodemailer supports array of emails
            subject: `👤 CarHub360 - NEW USER REGISTRATION! 👤`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background: #f8f9fa;">
                    <!-- Modern Header with User Theme -->
                    <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 25px; text-align: center; border-radius: 15px 15px 0 0; position: relative; overflow: hidden;">
                        <div style="position: absolute; top: -50%; right: -10%; width: 200px; height: 200px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                        <div style="position: absolute; bottom: -30%; left: -5%; width: 150px; height: 150px; background: rgba(255,255,255,0.08); border-radius: 50%;"></div>
                        <div style="position: relative; z-index: 2;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                                👤 CarHub360
                            </h1>
                            <p style="margin: 8px 0 0 0; opacity: 0.95; font-size: 16px; font-weight: 500;">
                                🆕 NEW USER REGISTERED 🆕
                            </p>
                        </div>
                    </div>
                    
                    <!-- Growth Alert Banner -->
                    <div style="background: linear-gradient(90deg, #4facfe, #00f2fe); color: white; padding: 12px; text-align: center; font-weight: 600; font-size: 14px;">
                        📈 Community Growth: New Member Joined | ⏰ Registration Time: ${new Date().toLocaleTimeString()}
                    </div>
                    
                    <!-- Main Content -->
                    <div style="padding: 25px; background: white;">
                        <!-- User Information Card -->
                        <div style="background: linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #bbdefb; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            <h3 style="margin: 0 0 15px 0; color: #1565c0; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                                👤 NEW USER PROFILE
                            </h3>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #4facfe;">
                                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 3px;">📛 Full Name</div>
                                    <div style="font-weight: 600; color: #212529;">${userData?.name || 'N/A'}</div>
                                </div>
                                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #00f2fe;">
                                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 3px;">📧 Email Address</div>
                                    <div style="font-weight: 600; color: #212529;">${userData?.email || 'N/A'}</div>
                                </div>
                                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #28a745;">
                                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 3px;">📱 Phone Number</div>
                                    <div style="font-weight: 600; color: #212529;">${userData?.phone || 'Not Provided'}</div>
                                </div>
                                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #ffc107;">
                                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 3px;">🆔 User ID</div>
                                    <div style="font-weight: 600; color: #212529;">#${userData?.id || 'N/A'}</div>
                                </div>
                                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #dc3545;">
                                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 3px;">🎭 Account Type</div>
                                    <div style="font-weight: 600; color: #212529;">${userData?.role || 'User'}</div>
                                </div>
                                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #6f42c1;">
                                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 3px;">📅 Registration Date</div>
                                    <div style="font-weight: 600; color: #212529;">${new Date().toLocaleDateString()}</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Welcome Message Card -->
                        <div style="background: linear-gradient(135deg, #fff3cd 0%, #ffffff 100%); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #ffeaa7; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            <h3 style="margin: 0 0 15px 0; color: #856404; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                                🎉 WELCOME MESSAGE READY
                            </h3>
                            <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 0; line-height: 1.6; color: #212529; font-size: 15px;">
                                A new user has successfully registered and joined the CarHub360 community. They now have access to:
                                <ul style="margin: 10px 0; padding-left: 20px;">
                                    <li>🚗 Browse and book vehicles</li>
                                    <li>💬 Send messages and inquiries</li>
                                    <li>📊 View their dashboard</li>
                                    <li>⭐ Leave reviews and ratings</li>
                                </ul>
                            </div>
                        </div>
                        
                        <!-- Quick Actions -->
                        <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 12px; padding: 20px; margin-bottom: 20px; text-align: center;">
                            <h3 style="margin: 0 0 15px 0; color: white; font-size: 18px; font-weight: 600;">
                                🔥 QUICK ACTIONS 🔥
                            </h3>
                            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                                <a href="http://localhost:${process.env.PORT || 5000}/admin" style="background: white; color: #4facfe; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block; transition: transform 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    👥 View Users
                                </a>
                                <a href="mailto:${userData?.email || ''}" style="background: #28a745; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block; transition: transform 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    📧 Welcome User
                                </a>
                                <a href="http://localhost:${process.env.PORT || 5000}/admin" style="background: #ffc107; color: #212529; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block; transition: transform 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    📊 User Analytics
                                </a>
                            </div>
                        </div>
                        
                        <!-- User Analytics -->
                        <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; border: 1px solid #dee2e6;">
                            <h3 style="margin: 0 0 15px 0; color: #495057; font-size: 16px; font-weight: 600;">
                                📈 USER GROWTH METRICS
                            </h3>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div style="text-align: center; padding: 12px; background: white; border-radius: 8px;">
                                    <div style="font-size: 20px; font-weight: 700; color: #4facfe;">👥</div>
                                    <div style="font-size: 12px; color: #6c757d;">Total Users</div>
                                    <div style="font-weight: 600; color: #212529;">Growing</div>
                                </div>
                                <div style="text-align: center; padding: 12px; background: white; border-radius: 8px;">
                                    <div style="font-size: 20px; font-weight: 700; color: #00f2fe;">🆕</div>
                                    <div style="font-size: 12px; color: #6c757d;">New Today</div>
                                    <div style="font-weight: 600; color: #212529;">+1</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Modern Footer -->
                    <div style="background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); color: white; padding: 20px; text-align: center; border-radius: 0 0 15px 15px;">
                        <div style="margin-bottom: 10px;">
                            <span style="display: inline-block; background: rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 20px; font-size: 12px; margin: 0 5px;">
                                🚗 CarHub360
                            </span>
                            <span style="display: inline-block; background: rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 20px; font-size: 12px; margin: 0 5px;">
                                👥 User Growth
                            </span>
                            <span style="display: inline-block; background: rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 20px; font-size: 12px; margin: 0 5px;">
                                🔐 Secure Platform
                            </span>
                        </div>
                        <p style="margin: 0; font-size: 11px; opacity: 0.8;">
                            This is an automated notification from CarHub360. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Registration notification email sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Error sending registration notification email:', error);
        return { success: false, error: error.message };
    }
};

// Send service booking notification email to admin
const sendServiceBookingNotification = async (bookingData, serviceData, userData) => {
    try {
        const transporter = createTransporter();
        
        // Parse multiple admin emails
        const adminEmails = process.env.ADMIN_EMAIL || 'admin@carhub360.com';
        const emailList = adminEmails.split(',').map(email => email.trim()).filter(email => email);
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: emailList, // nodemailer supports array of emails
            subject: `🔧 CarHub360 - NEW SERVICE BOOKING! 🔧`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background: #f8f9fa;">
                    <!-- Modern Header with Service Theme -->
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; text-align: center; border-radius: 15px 15px 0 0; position: relative; overflow: hidden;">
                        <div style="position: absolute; top: -50%; right: -10%; width: 200px; height: 200px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                        <div style="position: absolute; bottom: -30%; left: -5%; width: 150px; height: 150px; background: rgba(255,255,255,0.08); border-radius: 50%;"></div>
                        <div style="position: relative; z-index: 2;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                                🔧 CarHub360
                            </h1>
                            <p style="margin: 8px 0 0 0; opacity: 0.95; font-size: 16px; font-weight: 500;">
                                🛠️ NEW SERVICE BOOKING RECEIVED 🛠️
                            </p>
                        </div>
                    </div>
                    
                    <!-- Service Alert Banner -->
                    <div style="background: linear-gradient(90deg, #667eea, #764ba2); color: white; padding: 12px; text-align: center; font-weight: 600; font-size: 14px;">
                        🔧 Service Revenue: ৳${bookingData.total_amount?.toLocaleString() || 'N/A'} | ⏰ Booking Time: ${new Date().toLocaleTimeString()}
                    </div>
                    
                    <!-- Main Content -->
                    <div style="padding: 25px; background: white;">
                        <!-- Service Details Card -->
                        <div style="background: linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #bbdefb; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            <h3 style="margin: 0 0 15px 0; color: #1565c0; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                                🔧 SERVICE DETAILS
                            </h3>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #667eea;">
                                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 3px;">🔧 Service Name</div>
                                    <div style="font-weight: 600; color: #212529;">${serviceData?.service_name || 'N/A'}</div>
                                </div>
                                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #764ba2;">
                                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 3px;">📂 Category</div>
                                    <div style="font-weight: 600; color: #212529;">${serviceData?.category || 'N/A'}</div>
                                </div>
                                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #28a745;">
                                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 3px;">💰 Service Price</div>
                                    <div style="font-weight: 600; color: #28a745; font-size: 16px;">৳${bookingData.total_amount?.toLocaleString() || 'N/A'}</div>
                                </div>
                                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #ffc107;">
                                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 3px;">🆔 Booking Reference</div>
                                    <div style="font-weight: 600; color: #212529;">${bookingData.booking_reference}</div>
                                </div>
                                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #dc3545;">
                                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 3px;">📅 Scheduled Date</div>
                                    <div style="font-weight: 600; color: #212529;">${new Date(bookingData.scheduled_date).toLocaleDateString()}</div>
                                </div>
                                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #007bff;">
                                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 3px;">⏰ Scheduled Time</div>
                                    <div style="font-weight: 600; color: #212529;">${new Date(bookingData.scheduled_date).toLocaleTimeString()}</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Customer Information Card -->
                        <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #dee2e6; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            <h3 style="margin: 0 0 15px 0; color: #495057; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                                👤 CUSTOMER INFORMATION
                            </h3>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #007bff;">
                                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 3px;">📛 Name</div>
                                    <div style="font-weight: 600; color: #212529;">${userData?.name || 'N/A'}</div>
                                </div>
                                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #28a745;">
                                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 3px;">📧 Email</div>
                                    <div style="font-weight: 600; color: #212529;">${userData?.email || 'N/A'}</div>
                                </div>
                                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #ffc107;">
                                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 3px;">📱 Phone</div>
                                    <div style="font-weight: 600; color: #212529;">${userData?.phone || 'N/A'}</div>
                                </div>
                                <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #dc3545;">
                                    <div style="font-size: 12px; color: #6c757d; margin-bottom: 3px;">⏰ Booking Time</div>
                                    <div style="font-weight: 600; color: #212529;">${new Date().toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                        
                        ${bookingData.service_location ? `
                        <!-- Service Location Card -->
                        <div style="background: linear-gradient(135deg, #fff3cd 0%, #ffffff 100%); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #ffeaa7; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            <h3 style="margin: 0 0 15px 0; color: #856404; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                                📍 SERVICE LOCATION
                            </h3>
                            <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 0; line-height: 1.6; color: #212529; font-size: 15px;">
                                ${bookingData.service_location}
                            </div>
                        </div>
                        ` : ''}
                        
                        ${bookingData.customer_notes ? `
                        <!-- Customer Notes Card -->
                        <div style="background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #dee2e6; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            <h3 style="margin: 0 0 15px 0; color: #495057; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                                📝 CUSTOMER NOTES
                            </h3>
                            <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff; margin: 0; line-height: 1.6; color: #212529; font-size: 15px;">
                                ${bookingData.customer_notes}
                            </div>
                        </div>
                        ` : ''}
                        
                        <!-- Quick Actions -->
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 20px; margin-bottom: 20px; text-align: center;">
                            <h3 style="margin: 0 0 15px 0; color: white; font-size: 18px; font-weight: 600;">
                                🔥 QUICK ACTIONS 🔥
                            </h3>
                            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                                <a href="http://localhost:${process.env.PORT || 5000}/admin" style="background: white; color: #667eea; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block; transition: transform 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    📋 View Booking
                                </a>
                                <a href="tel:${userData?.phone || ''}" style="background: #28a745; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block; transition: transform 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    📞 Call Customer
                                </a>
                                <a href="mailto:${userData?.email || ''}" style="background: #007bff; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block; transition: transform 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    📧 Email Customer
                                </a>
                            </div>
                        </div>
                        
                        <!-- Service Analytics -->
                        <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; border: 1px solid #dee2e6;">
                            <h3 style="margin: 0 0 15px 0; color: #495057; font-size: 16px; font-weight: 600;">
                                📈 SERVICE BOOKING ANALYTICS
                            </h3>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div style="text-align: center; padding: 12px; background: white; border-radius: 8px;">
                                    <div style="font-size: 20px; font-weight: 700; color: #667eea;">💰</div>
                                    <div style="font-size: 12px; color: #6c757d;">Revenue Impact</div>
                                    <div style="font-weight: 600; color: #28a745; font-size: 16px;">৳${bookingData.total_amount?.toLocaleString() || 'N/A'}</div>
                                </div>
                                <div style="text-align: center; padding: 12px; background: white; border-radius: 8px;">
                                    <div style="font-size: 20px; font-weight: 700; color: #764ba2;">🔧</div>
                                    <div style="font-size: 12px; color: #6c757d;">Service Type</div>
                                    <div style="font-weight: 600; color: #212529;">${serviceData?.category || 'N/A'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Modern Footer -->
                    <div style="background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); color: white; padding: 20px; text-align: center; border-radius: 0 0 15px 15px;">
                        <div style="margin-bottom: 10px;">
                            <span style="display: inline-block; background: rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 20px; font-size: 12px; margin: 0 5px;">
                                🚗 CarHub360
                            </span>
                            <span style="display: inline-block; background: rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 20px; font-size: 12px; margin: 0 5px;">
                                🔧 Service Booking
                            </span>
                            <span style="display: inline-block; background: rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 20px; font-size: 12px; margin: 0 5px;">
                                💰 Revenue Tracking
                            </span>
                        </div>
                        <p style="margin: 0; font-size: 11px; opacity: 0.8;">
                            This is an automated notification from CarHub360. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Service booking notification email sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Error sending service booking notification email:', error);
        return { success: false, error: error.message };
    }
};

// Test email configuration
const testEmailConfiguration = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('Email configuration is valid');
        return { success: true, message: 'Email configuration is valid' };
    } catch (error) {
        console.error('Email configuration error:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendBookingNotification,
    sendMessageNotification,
    sendRegistrationNotification,
    sendServiceBookingNotification,
    testEmailConfiguration
};