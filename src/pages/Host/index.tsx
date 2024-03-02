import QRCodeStyling from "qr-code-styling-2";
import { Unity, useUnityContext } from "react-unity-webgl";

function makeid(length: number) {
  let result = "";
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export default function Host() {
  const { unityProvider, sendMessage } = useUnityContext({
    loaderUrl: "./Host/Build/Host.loader.js",
    dataUrl: "./Host/Build/Host.data.br",
    frameworkUrl: "./Host/Build/Host.framework.js.br",
    codeUrl: "./Host/Build/Host.wasm.br",
  });

  const HandleQRCode = () => {
    const code = makeid(4)
    const url = `${window.location.origin}?code=${code}`;
    console.log(url);
    const qrCode = new QRCodeStyling({
      width: 200,
      height: 200,
      type: "svg",
      data: url,
      dotsOptions: {
        type: "extra-rounded",
      },
      imageOptions: {
        crossOrigin: "anonymous",
        hideBackgroundDots: false,
      },
      qrOptions: {
        errorCorrectionLevel: "M",
      },
    });

    (async () => {
      const blob = await qrCode.getRawData("png");
      if (blob === null) return;
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = function () {
        const base64data = reader.result;
        sendMessage("Canvas", "CreateQRCode", base64data as string);
        sendMessage("Canvas", "CreateCode", code);
      };
    })();
  };

  return (
    <div>
      <button onClick={() => HandleQRCode()}>Create QR Code</button>
      <Unity unityProvider={unityProvider} style={{ width: "960px", height: "600px" }} />
    </div>
  );
}
