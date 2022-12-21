const express = require("express");
const app = express();

const SapCfAxios = require("sap-cf-axios").default;

const passport = require("passport");
const { JWTStrategy } = require("@sap/xssec");
const xsenv = require("@sap/xsenv");
const xml = require("xml");

passport.use(new JWTStrategy(xsenv.getServices({ uaa: { tag: "xsuaa" } }).uaa));
app.use(passport.initialize());
app.use(passport.authenticate("JWT", { session: false }));
var axiosSimple = require('axios');

const oVCAP_SERVICES = JSON.parse(process.env.VCAP_SERVICES);
const oConnectivityServiceCredentials =
  oVCAP_SERVICES.connectivity[0].credentials;

const handleRequest = async (req, res) => {
  // console.log("myheadaers", req.headers);
  // res.send(req.headers)

  const axios = SapCfAxios("Dest_s4_he4_sso");
  var authorization = req.headers.authorization;

  var params = new URLSearchParams();
  params.append("client_id", oConnectivityServiceCredentials.clientid);
  params.append("client_secret", oConnectivityServiceCredentials.clientsecret);
  params.append("grant_type", "client_credentials");

  var tokentechnical = ""
  try{
  var response1 = await axiosSimple({
    method: "post",
    url: oConnectivityServiceCredentials.token_service_url + "/oauth/token",
    params: params,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
  });

  tokentechnical = response1.data.access_token
}catch(e){
  console.log(e)
}

  try{

    console.log("auth",authorization)
  const response = await axios({
    method: "GET",
    url: "/ZMUNISH001Set",
    // params: {
    //   $format: "json",
    // },
    headers: {
      "content-type": "application/json",
      // authorization,
      "SAP-Connectivity-Technical-Authentication":"Bearer "+tokentechnical
    },
   
  });
  console.log(response.data);
  res.set('Content-Type','application/json')
  res.send(JSON.stringify(response.data));

  }catch(e){
    console.log(JSON.stringify(e))
    res.send(JSON.stringify(e))
  }
 
};

app.get("/", handleRequest);
const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("myapp listening on port " + port);
});
