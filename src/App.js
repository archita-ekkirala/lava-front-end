import React, { useEffect, useState } from "react";
import Lava from "./components/Lava";

function getUrlParams() {
  const params = {};
  window.location.search
    .substring(1)
    .split("&")
    .forEach((param) => {
      const [key, value] = param.split("=");
      params[decodeURIComponent(key)] = decodeURIComponent(value || "");
    });
  return params;
}

function App() {
  const [message, setMessage] = useState("🔐 Waiting for SMART Authorization Token...");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const clientIdMapping = {
    "https://bfee16.devhcp.com/fhir": "98da0d36-207d-11f0-9d81-0a2d94f3c43f",
    "https://fhir-ehr-code.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d": "4a80ce69-5e36-4a99-adc7-5ea3c6b46399",
  };  

  useEffect(() => {
    const urlParams = getUrlParams();
    const serviceUri = urlParams["iss"];
    const launch = urlParams["launch"];
    const code = urlParams["code"];
    const storedUri = sessionStorage.getItem("serverUri") || serviceUri;
    const clientId = clientIdMapping[storedUri] || "4a80ce69-5e36-4a99-adc7-5ea3c6b46399";
    //const clientId = "4a80ce69-5e36-4a99-adc7-5ea3c6b46399";
    const scope = "launch/patient openid fhirUser patient/*.read";
    const redirectUri = "http://localhost:3000/index";

   // if(sessionStorage.getItem("tokenExchanged") === "true") return;
    if (code) {
      const tokenUri = sessionStorage.getItem("tokenUri");
      const data = `grant_type=authorization_code&code=${encodeURIComponent(
        code
      )}&redirect_uri=${encodeURIComponent(redirectUri)}&client_id=${encodeURIComponent(
        clientId
      )}`;
      console.log(data)

      fetch(tokenUri, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: data,
      })
        .then((res) => res.json())
        .then((tokenResponse) => {
          if(tokenResponse.access_token != undefined){
            sessionStorage.setItem("token", tokenResponse.access_token);
            sessionStorage.setItem("auth_response", JSON.stringify(tokenResponse));
            //sessionStorage.setItem("tokenExchanged", "true");
            setIsAuthorized(true);
          }
        })
        .catch((err) => {
          console.error("Token Exchange Error:", err);
          setMessage(`❌ Error exchanging code for token: ${err.message}`);
        });
    } else if (serviceUri) {
      console.log(serviceUri);
      // EHR or Standalone launch (depending on presence of `launch`)
      fetch(`${serviceUri}/metadata`)
        .then((res) => res.json())
        .then((metadata) => {
          const securityExt = metadata.rest?.[0]?.security?.extension || [];
          const oauthExt = securityExt.find(
            (ext) =>
              ext.url === "http://fhir-registry.smarthealthit.org/StructureDefinition/oauth-uris"
          );

          if (!oauthExt) throw new Error("No OAuth URIs found in metadata");

          const authUri = oauthExt.extension.find((e) => e.url === "authorize")?.valueUri;
          const tokenUri = oauthExt.extension.find((e) => e.url === "token")?.valueUri;

          if (!authUri || !tokenUri)
            throw new Error("Authorization or Token URI not found in metadata");

          sessionStorage.setItem("tokenUri", tokenUri);
          sessionStorage.setItem("serverUri", serviceUri);

          let authorizeUrl =
            `${authUri}?` +
            `response_type=code&` +
            `client_id=${encodeURIComponent(clientId)}&` +
            `scope=${encodeURIComponent(scope)}&` +
            `state=76cb5332-f09f-4325-92d6-baa85a65d218&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `aud=${encodeURIComponent(serviceUri)}`;

          
          if (launch) {
            authorizeUrl += `&launch=${encodeURIComponent(launch)}`;
          }

          window.location.href = authorizeUrl;
        })
        .catch((err) => {
          console.error("SMART Launch Error:", err);
          setMessage(`❌ Error launching SMART app: ${err.message}`);
        });
    }
  }, []);

  return (
    <div style={{ paddingLeft: "2rem", fontSize: "1.2rem", alignItems:"center" }}>
      {isAuthorized ? <Lava /> : message}
    </div>
  );
}

export default App;
