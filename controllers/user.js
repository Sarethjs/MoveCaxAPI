const User = require('../model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const moment = require('moment');
const randomstring = require('randomstring');
const sgMail = require('@sendgrid/mail');


const createUser = async (req, res) => {

    const { names, lastnames, email, password, dateBorn, sex } = req.body;

    try {

        console.log(`Creating user with: ${email}`);

        // Validate if user exists
        const user = await User.findOne({
            where: {
                email: email
            }
        });

        if (user) {
            res.status(500).json({ 'error': 'El correo ya está en uso' });
            console.log(`Create operation failed, email already in use: ${email}`);
            return;
        }

        // Salt for hash
        const salt = await bcrypt.genSalt();

        // Protect password
        const encryptedPassword = await bcrypt.hash(password, salt);

        const formattedDate = moment(dateBorn, 'MMM DD, YYYY hh:mm:ss A').format('YYYY-MM-DD HH:mm:ss');

        // Registering new User
        const newUser = await User.create({
            names: names,
            lastnames: lastnames,
            email: email.toLowerCase(),
            password: encryptedPassword,
            dateBorn: formattedDate,
            sex: sex
        });

        console.log(`User created with: ${newUser.email}`);
        res.status(201).json(newUser);

    } catch (error) {
        console.log(`Error: ${error}`);
        console.error(error);
        res.status(500).json({
            'error': 'Error creando usuario'
        });
    }
};


// login
const loginUser = async (req, res) => {

    const { email, password } = req.body;

    try {
        console.log(`Trying loggin: ${email}`);
        const user = await User.findOne({
            where: {
                email: email
            }
        });

        if (!user) {
            res.status(404).json({ 'error': 'Usuario no existe' });
            console.log(`Loggin failed, user doesn't exists ${email}`);
            return;
        }

        // Compare password
        const passIsCorrect = await bcrypt.compare(password, user.password);

        if (!passIsCorrect) {
            res.status(401).json({ 'error': 'Contraseña incorrecta' });
            console.log(`Loggin failed, password incorrect ${email}`);
            return;
        }

        // Create token
        const token = uuidv4();

        // Save and update Token
        user.token = token;
        await user.save();
        console.log(`User logged: ${user.email}`);
        res.status(200).json(user);

    } catch (error) {
        console.log(`Error: ${error}`);
        console.error(error);
        res.status(500).json({
            'error': 'Error al iniciar sesión'
        });
    }
};

// Update user
const updatePassword = async (req, res) => {

    const { email, password, newPassword } = req.body;

    console.log(`Trying change password by ${email}`);


    try {

        const user = await User.findOne({
            where: { email: email }
        });

        // Verify password
        const passIsCorrect = await bcrypt.compare(password, user.password);

        if (!passIsCorrect) {
            res.status(401).json({ 'error': 'Contraseña incorrecta' });
            console.log(`Password incorrect for ${email}`);
            return;
        }

        // Encrypt password again
        // Salt for hash
        const salt = await bcrypt.genSalt();

        // Protect password
        const encryptedPassword = await bcrypt.hash(newPassword, salt);

        // Update user
        user.password = encryptedPassword;
        await user.save();
        console.log(`Updated password by: ${user.email}`);
        res.status(200).json(user);

    } catch (error) {
        console.log(`Error: ${error}`);
        console.error(error);
        res.status(500).json({ 'error': 'Error al actualizar contraseña' });
    }
};

const findUser = async (req, res) => {

    try {
        const { token } = req.body;

        console.log(`Loggin by token ${token}`);

        const user = await User.findOne({
            where: { token: token }
        });

        if (!user) {
            res.status(404).json({ "error": 'Token not found' });
            return;
        }

        console.log(`Login by token: ${user.email}`)
        res.status(200).json(user);

    } catch (error) {
        console.log(`Error: ${error}`);
        res.status(500).json({ 'error': 'Server error' });
    }
}

const logoutUser = async (req, res) => {

    const { email } = req.body;

    try {

        console.log(`Closing session for ${email}`);

        const user = await User.findOne({
            where: { email: email }
        });

        if (!user) {
            res.status(401).json({ 'error': 'User not found' });
            console.log(`Logout failed to ${email}`);
            return;
        }

        user.token = null;
        await user.save();
        console.log(`Good bye: ${user.email}`)
        res.status(200).json({ 'message': 'Good bye' });

    } catch (error) {
        console.log(`Error: ${error}`);
        console.error(error);
        res.send(500).json({ 'error': 'Server error' });
    }
};

const restorePassword = async (req, res) => {

    const { email } = req.body;

    console.log('Restoring password...');

    try {
        const user = await User.findOne({
            where: { email: email }
        });

        if (user) {
            const newPassword = await randomstring.generate({
                length: 12, charset: 'alphanumeric'
            });

            // Salt for hash
            const salt = await bcrypt.genSalt();

            // Protect password
            const encryptedPassword = await bcrypt.hash(newPassword, salt);
            user.password = encryptedPassword;
            await user.save();

            sgMail.setApiKey('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')
            const msg = {
                to: user.email, // Change to your recipient
                from: 'movecax1003@hotmail.com', // Change to your verified sender
                subject: 'Restore password request',
                text: 'and easy to do anywhere, even with Node.js',
                html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
                <html data-editor-version="2" class="sg-campaigns" xmlns="http://www.w3.org/1999/xhtml">
                    <head>
                      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1">
                      <!--[if !mso]><!-->
                      <meta http-equiv="X-UA-Compatible" content="IE=Edge">
                      <!--<![endif]-->
                      <!--[if (gte mso 9)|(IE)]>
                      <xml>
                        <o:OfficeDocumentSettings>
                          <o:AllowPNG/>
                          <o:PixelsPerInch>96</o:PixelsPerInch>
                        </o:OfficeDocumentSettings>
                      </xml>
                      <![endif]-->
                      <!--[if (gte mso 9)|(IE)]>
                  <style type="text/css">
                    body {width: 600px;margin: 0 auto;}
                    table {border-collapse: collapse;}
                    table, td {mso-table-lspace: 0pt;mso-table-rspace: 0pt;}
                    img {-ms-interpolation-mode: bicubic;}
                  </style>
                <![endif]-->
                      <style type="text/css">
                    body, p, div {
                      font-family: inherit;
                      font-size: 14px;
                    }
                    body {
                      color: #000000;
                    }
                    body a {
                      color: #1188E6;
                      text-decoration: none;
                    }
                    p { margin: 0; padding: 0; }
                    table.wrapper {
                      width:100% !important;
                      table-layout: fixed;
                      -webkit-font-smoothing: antialiased;
                      -webkit-text-size-adjust: 100%;
                      -moz-text-size-adjust: 100%;
                      -ms-text-size-adjust: 100%;
                    }
                    img.max-width {
                      max-width: 100% !important;
                    }
                    .column.of-2 {
                      width: 50%;
                    }
                    .column.of-3 {
                      width: 33.333%;
                    }
                    .column.of-4 {
                      width: 25%;
                    }
                    ul ul ul ul  {
                      list-style-type: disc !important;
                    }
                    ol ol {
                      list-style-type: lower-roman !important;
                    }
                    ol ol ol {
                      list-style-type: lower-latin !important;
                    }
                    ol ol ol ol {
                      list-style-type: decimal !important;
                    }
                    @media screen and (max-width:480px) {
                      .preheader .rightColumnContent,
                      .footer .rightColumnContent {
                        text-align: left !important;
                      }
                      .preheader .rightColumnContent div,
                      .preheader .rightColumnContent span,
                      .footer .rightColumnContent div,
                      .footer .rightColumnContent span {
                        text-align: left !important;
                      }
                      .preheader .rightColumnContent,
                      .preheader .leftColumnContent {
                        font-size: 80% !important;
                        padding: 5px 0;
                      }
                      table.wrapper-mobile {
                        width: 100% !important;
                        table-layout: fixed;
                      }
                      img.max-width {
                        height: auto !important;
                        max-width: 100% !important;
                      }
                      a.bulletproof-button {
                        display: block !important;
                        width: auto !important;
                        font-size: 80%;
                        padding-left: 0 !important;
                        padding-right: 0 !important;
                      }
                      .columns {
                        width: 100% !important;
                      }
                      .column {
                        display: block !important;
                        width: 100% !important;
                        padding-left: 0 !important;
                        padding-right: 0 !important;
                        margin-left: 0 !important;
                        margin-right: 0 !important;
                      }
                      .social-icon-column {
                        display: inline-block !important;
                      }
                    }
                  </style>
                      <!--user entered Head Start--><link href="https://fonts.googleapis.com/css?family=Muli&display=swap" rel="stylesheet"><style>
                body {font-family: 'Muli', sans-serif;}
                </style><!--End Head user entered-->
                    </head>
                    <body>
                      <center class="wrapper" data-link-color="#1188E6" data-body-style="font-size:14px; font-family:inherit; color:#000000; background-color:#FFFFFF;">
                        <div class="webkit">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%" class="wrapper" bgcolor="#FFFFFF">
                            <tr>
                              <td valign="top" bgcolor="#FFFFFF" width="100%">
                                <table width="100%" role="content-container" class="outer" align="center" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td width="100%">
                                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                          <td>
                                            <!--[if mso]>
                    <center>
                    <table><tr><td width="600">
                  <![endif]-->
                                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px;" align="center">
                                                      <tr>
                                                        <td role="modules-container" style="padding:0px 0px 0px 0px; color:#000000; text-align:left;" bgcolor="#FFFFFF" width="100%" align="left"><table class="module preheader preheader-hide" role="module" data-type="preheader" border="0" cellpadding="0" cellspacing="0" width="100%" style="display: none !important; mso-hide: all; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;">
                    <tr>
                      <td role="module-content">
                        <p></p>
                      </td>
                    </tr>
                  </table><table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:30px 20px 30px 20px;" bgcolor="#f6f6f6" data-distribution="1">
                    <tbody>
                      <tr role="module-content">
                        <td height="100%" valign="top"><table width="540" style="width:540px; border-spacing:0; border-collapse:collapse; margin:0px 10px 0px 10px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="" class="column column-0">
                      <tbody>
                        <tr>
                          <td style="padding:0px;margin:0px;border-spacing:0;"><table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="72aac1ba-9036-4a77-b9d5-9a60d9b05cba">
                    <tbody>
                      <tr>
                        <td style="font-size:6px; line-height:10px; padding:0px 0px 0px 0px;" valign="top" align="center">
                          <img class="max-width" border="0" style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px;" width="29" alt="" data-proportionally-constrained="true" data-responsive="false" src="http://cdn.mcauto-images-production.sendgrid.net/954c252fedab403f/9200c1c9-b1bd-47ed-993c-ee2950a0f239/29x27.png" height="27">
                        </td>
                      </tr>
                    </tbody>
                  </table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="331cde94-eb45-45dc-8852-b7dbeb9101d7">
                    <tbody>
                      <tr>
                        <td style="padding:0px 0px 20px 0px;" role="module-content" bgcolor="">
                        </td>
                      </tr>
                    </tbody>
                  </table><table class="wrapper" role="module" data-type="image" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="d8508015-a2cb-488c-9877-d46adf313282">
                    <tbody>
                      <tr>
                        <td style="font-size:6px; line-height:10px; padding:0px 0px 0px 0px;" valign="top" align="center">
                          <img class="max-width" border="0" style="display:block; color:#000000; text-decoration:none; font-family:Helvetica, arial, sans-serif; font-size:16px;" width="100" alt="" data-proportionally-constrained="true" data-responsive="false" src="http://cdn.mcauto-images-production.sendgrid.net/17857ad48c3e8b01/21ffd3c0-8b55-4fbf-b616-2d153237cb53/500x500.png" height="100">
                        </td>
                      </tr>
                    </tbody>
                  </table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="27716fe9-ee64-4a64-94f9-a4f28bc172a0">
                    <tbody>
                      <tr>
                        <td style="padding:0px 0px 30px 0px;" role="module-content" bgcolor="">
                        </td>
                      </tr>
                    </tbody>
                  </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="948e3f3f-5214-4721-a90e-625a47b1c957" data-mc-module-version="2019-10-22">
                    <tbody>
                      <tr>
                        <td style="padding:50px 30px 18px 30px; line-height:36px; text-align:inherit; background-color:#ffffff;" height="100%" valign="top" bgcolor="#ffffff" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="font-size: 43px">Restablecer contraseña</span></div><div></div></div></td>
                      </tr>
                    </tbody>
                  </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="a10dcb57-ad22-4f4d-b765-1d427dfddb4e" data-mc-module-version="2019-10-22">
                    <tbody>
                      <tr>
                        <td style="padding:18px 30px 18px 30px; line-height:22px; text-align:inherit; background-color:#ffffff;" height="100%" valign="top" bgcolor="#ffffff" role="module-content"><div><div style="font-family: inherit; text-align: center">Tu nueva contraseña es la siguiente</div>
                <div style="font-family: inherit; text-align: center"><span style="color: #ffbe00; font-size: 18px"><strong>&nbsp;${newPassword}</strong></span></div><div></div></div></td>
                      </tr>
                    </tbody>
                  </table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="7770fdab-634a-4f62-a277-1c66b2646d8d">
                    <tbody>
                      <tr>
                        <td style="padding:0px 0px 20px 0px;" role="module-content" bgcolor="#ffffff">
                        </td>
                      </tr>
                    </tbody>
                  </table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="7770fdab-634a-4f62-a277-1c66b2646d8d.1">
                    <tbody>
                      <tr>
                        <td style="padding:0px 0px 50px 0px;" role="module-content" bgcolor="#ffffff">
                        </td>
                      </tr>
                    </tbody>
                  </table><table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="a265ebb9-ab9c-43e8-9009-54d6151b1600" data-mc-module-version="2019-10-22">
                    <tbody>
                      <tr>
                        <td style="padding:50px 30px 50px 30px; line-height:22px; text-align:inherit; background-color:#000;" height="100%" valign="top" bgcolor="#000" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="color: #ffffff; font-size: 18px"><strong>Te recomendamos seguir los siguientes pasos:</strong></span></div>
                <div style="font-family: inherit; text-align: center"><br></div>
                <div style="font-family: inherit; text-align: left"><span style="color: #ffffff; font-size: 18px">1. Accede a tu cuenta con tu nueva contraseña.</span></div>
                <div style="font-family: inherit; text-align: center"><br></div>
                <div style="font-family: inherit; text-align: left"><span style="color: #ffffff; font-size: 18px">2. Dirígete a la sección de perfil.</span></div>
                <div style="font-family: inherit; text-align: center"><br></div>
                <div style="font-family: inherit; text-align: left"><span style="color: #ffffff; font-size: 18px">3. Cambia tu contraseña</span></div>
                <div style="font-family: inherit; text-align: center"><br></div>
                <div style="font-family: inherit; text-align: center"><span style="color: #ffffff; font-size: 18px">¿Necesitas ayuda? Responde a este emai o escribenos a</span></div>
                <div style="font-family: inherit; text-align: center"><span style="color: #ffffff; font-size: 18px"><strong>movecax1003@hotmail.com</strong></span></div><div></div></div></td>
                      </tr>
                    </tbody>
                  </table><table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="c37cc5b7-79f4-4ac8-b825-9645974c984e">
                    <tbody>
                      <tr>
                        <td style="padding:0px 0px 30px 0px;" role="module-content" bgcolor="6E6E6E">
                        </td>
                      </tr>
                    </tbody>
                  </table></td>
                        </tr>
                      </tbody>
                    </table></td>
                      </tr>
                    </tbody>
                  </table><div data-role="module-unsubscribe" class="module" role="module" data-type="unsubscribe" style="color:#444444; font-size:12px; line-height:20px; padding:16px 16px 16px 16px; text-align:Center;" data-muid="4e838cf3-9892-4a6d-94d6-170e474d21e5"><div class="Unsubscribe--addressLine"></div><p style="font-size:12px; line-height:20px;"><a target="_blank" class="Unsubscribe--unsubscribeLink zzzzzzz" href="{{{unsubscribe}}}" style="">Unsubscribe</a> - <a href="{{{unsubscribe_preferences}}}" target="_blank" class="Unsubscribe--unsubscribePreferences" style="">Unsubscribe Preferences</a></p></div><table border="0" cellpadding="0" cellspacing="0" class="module" data-role="module-button" data-type="button" role="module" style="table-layout:fixed;" width="100%" data-muid="550f60a9-c478-496c-b705-077cf7b1ba9a">
                      <tbody>
                        <tr>
                          <td align="center" bgcolor="" class="outer-td" style="padding:0px 0px 20px 0px;">
                            <table border="0" cellpadding="0" cellspacing="0" class="wrapper-mobile" style="text-align:center;">
                              <tbody>
                                <tr>
                                <td align="center" bgcolor="#f5f8fd" class="inner-td" style="border-radius:6px; font-size:16px; text-align:center; background-color:inherit;"><a href="https://sendgrid.com/" style="background-color:#f5f8fd; border:1px solid #f5f8fd; border-color:#f5f8fd; border-radius:25px; border-width:1px; color:#a8b9d5; display:inline-block; font-size:10px; font-weight:normal; letter-spacing:0px; line-height:normal; padding:5px 18px 5px 18px; text-align:center; text-decoration:none; border-style:solid; font-family:helvetica,sans-serif;" target="_blank">♥ POWERED BY TWILIO SENDGRID</a></td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table></td>
                                                      </tr>
                                                    </table>
                                                    <!--[if mso]>
                                                  </td>
                                                </tr>
                                              </table>
                                            </center>
                                            <![endif]-->
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </div>
                      </center>
                    </body>
                  </html>`,
            }
            sgMail
                .send(msg)
                .then(() => {
                    res.status(200).json({ 'msg': 'Revisar tu email' });
                    console.log(`Email sent to: ${user.email}`);
                })
                .catch((error) => {
                    console.error(error)
                });

        } else {
            console.log('Invalid request, email doesn\'t exist');
            res.status(404).json({ '': 'El email no existe' });
        }

    } catch (err) {
        res.status(500).json({ 'error': `${err}` });
        console.log('Error finding user');
        console.err(err);
    }
};


module.exports = {
    createUser,
    loginUser,
    updatePassword,
    findUser,
    logoutUser,
    restorePassword
}
