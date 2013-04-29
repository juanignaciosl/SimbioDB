
  var CONFIG  = require('config-heroku');
  var heredoc = require('heredoc');
  
  exports.email = heredoc(function() {/*
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title<%= yield :subject %></title>
        <style type="text/css" media="screen">

          #outlook a {padding:0;}
          body{width:100% !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; margin:0; padding:0;}
          .ExternalClass {width:100%;}
          .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div {line-height: 100%;}
          #backgroundTable {margin:0; padding:0; width:100% !important; line-height: 100% !important;}

          img {outline:none; text-decoration:none; -ms-interpolation-mode: bicubic;}
          a img {border:none;}
          .image_fix {display:block;}
          p {margin: 1em 0; -webkit-margin-before:0em!important; -webkit-margin-after:0em!important;}
          h1, h2, h3, h4, h5, h6 {color: #333333 !important; }
          h1 a, h2 a, h3 a, h4 a, h5 a, h6 a {color: #397DB9 !important;}
          h1 a:active, h2 a:active, h3 a:active, h4 a:active, h5 a:active, h6 a:active {
            color: #397DB9 !important;
          }
          h1 a:visited, h2 a:visited, h3 a:visited, h4 a:visited, h5 a:visited, h6 a:visited {
            color: #397DB9 !important;
          }
          table td {border-collapse: collapse;}
          a {color: #397DB9;}

          @media only screen and (max-device-width: 480px) {

            a[href^="tel"], a[href^="sms"] {
            text-decoration: none;
            color: #397DB9;
            pointer-events: none;
            cursor: default;
            }

            .mobile_link a[href^="tel"], .mobile_link a[href^="sms"] {
            text-decoration: default;
            color: #397DB9 !important;
            pointer-events: auto;
            cursor: default;
            }
          }


          @media only screen and (min-device-width: 768px) and (max-device-width: 1024px) {

            a[href^="tel"], a[href^="sms"] {
              text-decoration: none;
              color: #397DB9;
              pointer-events: none;
              cursor: default;
            }

            .mobile_link a[href^="tel"], .mobile_link a[href^="sms"] {
              text-decoration: default;
              color: #397DB9 !important;
              pointer-events: auto;
              cursor: default;
            }
          }

          @media only screen and (-webkit-min-device-pixel-ratio: 2) {}
          @media only screen and (-webkit-device-pixel-ratio:.75){}
          @media only screen and (-webkit-device-pixel-ratio:1){}
          @media only screen and (-webkit-device-pixel-ratio:1.5){}


          body {background-color: #ffffff;}
          h1 {font:bold 27px Arial!important; color:#333333!important;}
          p.subtitle {font:normal 15px Arial!important; color:#666666;}
          a {border: none;text-decoration:none;}
          a:hover {text-decoration:underline; color:#2B6191;}
          a.activate:hover {color:#2B6191; text-decoration:none}
        </style>
      </head>
      <body>
        <table width="523" cellpadding="0" cellspacing="0" border="0" id="backgroundTable">
          <tr>
            <td>
              <table width="523" cellspacing="0" cellpadding="0" bgcolor="#FFFFFF" border="0">
                <tbody>
                  <tr width="523" height="34" border="0"></tr>
                </tbody>
              </table>

              <table width="523" border="0" cellspacing="0" cellpadding="0" height="90">
                <tbody>
                  <tr border="0" height="90">
                    <td align="left" width="34" height="90" border="0" valign="top"></td>
                    <td align="left" width="455" height="90" border="0" valign="top">
                      <table width="455" border="0" cellspacing="0" cellpadding="0">
                        <tr width="455" height="18">
                          <td height="18" valign="top"></td>
                        </tr>
                        <tr height="23">
                          <td width="20" valign="top"></td>
                          <td color="#333333" width="455" valign="top" height="23">
                            <h1 style="margin:0; padding:0; font:bold 27px Arial; color:#333333;"><font color="333333">Who are going to clean this week?</font></h1>
                          </td>
                        </tr>
                        <tr width="455" height="5">
                          <td height="10" valign="top"></td>
                        </tr>
                        <tr>
                          <td width="20" valign="top"></td>
                          <td color="#666666" width="455" valign="top" height="15">
                            <p style="width:455px; margin:0; padding:0; font:normal 15px Arial; color:#666666;"><font color="666666">These guys will take care of the Vizziotica office this week. It doesn't mean you don't have to help them. Don't be dirty and collaborate, it's easy and free.</font></p>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td align="right" width="34" height="90" border="0" valign="top"></td>
                  </tr>
                </tbody>
              </table>
              <table width="523" border="0" cellspacing="0" cellpadding="0">
                <tbody>
                  <tr align="left" width="455" height="24" border="0" valign="top" bgcolor="#FFFFFF"></tr>
                  <tr border="0">
                    <td align="left" width="54" height="57" border="0" valign="top"></td>
                    <td align="left" width="566" border="0" valign="top" bgcolor="#FFFFFF">
                      <table width="523" border="0" cellspacing="0" cellpadding="0">
                        <tbody>
                          <tr align="left" width="523" height="30" border="0" valign="top" bgcolor="#FFFFFF"></tr>
                          <tr align="left" width="523" height="100" border="0" valign="top" bgcolor="#FFFFFF">
                            <td align="left" width="200" height="100"></td>
                            <td align="left" width="100" height="100">
                              <img width="100" height="100" src="{{ host }}/img/{{ p1_twitter }}.png" title="{{ p1_alias }}"/>
                            </td>
                            <td align="left" valign="bottom" width="74" height="20">
                              <p style="font:bold 18px Arial; color:#ABABAB; text-align:center"><font color="ABABAB" size="8">+</font></p>
                            </td>
                            <td align="left" width="100" height="100">
                              <img width="100" height="100" src="{{ host }}/img/{{ p2_twitter }}.png" title="{{ p2_alias }}"/>
                            </td>
                            <td align="left" width="200" height="100"></td>
                          </tr>
                          <tr align="left" width="523" height="15" border="0" valign="top" bgcolor="#FFFFFF"></tr>
                          <tr align="left" width="523" height="18" border="0" valign="top" bgcolor="#FFFFFF">
                            <td align="left" height="18" width="200"></td>
                            <td align="left" height="18" width="100">
                              <p style="margin:0; padding:0; font:bold 16px Arial; color:#444444; text-align:center; -webkit-margin-before:0em!important; -webkit-margin-after:0em!important;"><font color="444444">{{ p1_alias }}</font></p>
                            </td>
                            <td align="left" height="18" width="74"></td>
                            <td align="left" height="18" width="100">
                              <p style="margin:0; padding:0; font:bold 16px Arial; color:#444444; text-align:center; -webkit-margin-before:0em!important; -webkit-margin-after:0em!important;"><font color="444444">{{ p2_alias }}</font></p>
                            </td>
                            <td align="left" height="18" width="200"></td>
                          </tr>
                          <tr align="left" width="523" height="3" border="0" valign="top" bgcolor="#FFFFFF"></tr>
                          <tr align="left" width="523" height="18" border="0" valign="top" bgcolor="#FFFFFF">
                            <td align="left" height="16" width="200"></td>
                            <td align="left" height="16" width="100">
                              <p style="margin:0; padding:0; text-align:center;"><a style="font:normal 14px Arial; color:#397DB9; -webkit-margin-before:0em!important; -webkit-margin-after:0em!important;" href="http://twitter.com/{{ p1_twitter }}">@{{ p1_twitter }}</a></p>
                            </td>
                            <td align="left" height="16" width="74"></td>
                            <td align="left" height="16" width="100">
                              <p style="margin:0; padding:0; text-align:center;"><a style="font:normal 14px Arial; color:#397DB9; -webkit-margin-before:0em!important; -webkit-margin-after:0em!important;" href="http://twitter.com/{{ p2_twitter }}">@{{ p2_twitter }}</a></p>
                            </td>
                            <td align="left" height="16" width="200"></td>
                          </tr>
                          <tr align="left" width="523" height="40" border="0" valign="top" bgcolor="#FFFFFF"></tr>
                        </tbody>
                      </table>
                    </td>
                    <td align="right" width="54" height="57" border="0" valign="top"></td>
                  </tr>
                </tbody>
              </table>
              <table width="523" border="0" cellspacing="0" cellpadding="0">
                <tbody>
                  <tr align="left" width="523" height="24" border="0" valign="top" bgcolor="#FFFFFF"></tr>
                  <tr align="left" width="523" height="24" border="0" valign="top" bgcolor="#FFFFFF">
                    <td align="left" width="34" height="15"></td>
                    <td align="left"><hr color="#DEDEDE" size="1" width="455"/></td>
                    <td align="left" width="34"></td>
                  </tr>
                </tbody>
              </table>
              <table width="523" border="0" cellspacing="0" cellpadding="0">
                <tbody>
                  <tr alignt="left" width="523">
                    <td align="left" width="34"></td>
                    <td align="left" width="224" height="24" border="0" valign="top" bgcolor="#FFFFFF">
                      <a style="margin:0; padding:0; font:normal 12px Arial; color:#397DB9;" href="{{ host }}">Go here to see the HTML</a>
                    </td>
                    <td align="right" width="224" height="24" border="0" valign="top" bgcolor="#FFFFFF">
                      <p style="width:224px; margin:0; padding:0; font:normal 12px Arial; color:#ABABAB; text-aling:right;">Eloy Gonzalo 27, 2º floor, 6th & 7th door</p>
                    </td>
                    <td align="left" width="34"></td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  */});