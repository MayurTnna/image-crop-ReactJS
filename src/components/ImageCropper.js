import React, { useState } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { storage } from "../firebase";

import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

const ImageCropper = () => {
  const [crop, setCrop] = useState({ aspect: 1 / 1 });
  const [image, setImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [url, setUrl] = useState(null);

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      resizeImage(e.target.files[0], 500, 500);
    }
  };
  function resizeImage(file, maxWidth, maxHeight) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const resizedDataUrl = canvas.toDataURL(reader.result);

        setImage(resizedDataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    return reader;
  }

  const onImageLoaded = (img) => {
    img.setAttribute("crossOrigin", "anonymous");
    if (img.naturalWidth < crop.width || img.naturalHeight < crop.height) {
      setCrop({
        aspect: img.naturalWidth / img.naturalHeight.naturalHeight,
        unit: "px",
        width: 500,
        height: 100,
      });
    }
  };

  const onCropComplete = (crop) => {
    if (image) {
      const img = new Image();
      img.src = image;
      const canvas = document.createElement("canvas");

      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalWidth / img.height;
      const pixelRatio = window.devicePixelRatio;
      canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
      canvas.height = Math.floor(crop.height * scaleY * pixelRatio);
      const ctx = canvas.getContext("2d");
      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingQuality = "high";
      const centerX = crop.width / 2;
      const centerY = crop.height / 2;

      const radius = Math.min(centerX, centerY);

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
      ctx.clip();
      ctx.save();

      ctx.drawImage(
        img,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );
      ctx.restore();
      setCroppedImage(canvas.toDataURL());
      console.log(canvas.toDataURL());
    }
  };
  function dataURLtoBlob(dataurl) {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  const onSave = () => {
    console.log(croppedImage);
    localStorage.setItem("user", croppedImage);
    const uniqueId = Date.now().toString();
    const imageBlob = dataURLtoBlob(croppedImage);
    const imageRef = ref(storage, `cropped_image_${uniqueId}`);
    uploadBytes(imageRef, imageBlob)
      .then(() => {
        getDownloadURL(imageRef)
          .then((url) => {
            setUrl(url);
          })
          .catch((error) => {
            console.log(error.message, "error getting image url");
          });
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={onSelectFile} />
      {image && (
        <ReactCrop
          src={image}
          crop={crop}
          circularCrop={true}
          aspect={1 / 1}
          onImageLoaded={onImageLoaded}
          onComplete={onCropComplete}
          onChange={(c) => setCrop(c)}
        >
          <img src={image} alt="Crop preview" />
        </ReactCrop>
      )}
      {croppedImage && (
        <div>
          <h2>Preview:</h2>
          <img src={croppedImage} alt="Cropped" />
          <button onClick={onSave}>Save</button>
        </div>
      )}
    </div>
  );
};

export default ImageCropper;
