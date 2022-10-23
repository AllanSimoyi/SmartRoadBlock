import { CloudConfig, CloudinaryImage } from "@cloudinary/url-gen";
import { thumbnail } from "@cloudinary/url-gen/actions/resize";
import { byRadius } from "@cloudinary/url-gen/actions/roundCorners";

export function cloudinaryImages (CLOUDINARY_CLOUD_NAME: string) {
  return {
    getThumbnail: (publicId: string) => {
      try {
        let myImage = new CloudinaryImage(publicId, new CloudConfig({ cloudName: CLOUDINARY_CLOUD_NAME }));
        myImage
          .resize(thumbnail().width(250).height(250))
          .format('auto')
          .quality('auto');
        return myImage;
      } catch (error) {
        console.log(JSON.stringify(error));
        return new CloudinaryImage(publicId, new CloudConfig({ cloudName: CLOUDINARY_CLOUD_NAME }));
      }
    },
    getUploadThumbnail: (publicId: string) => {
      try {
        let myImage = new CloudinaryImage(publicId, new CloudConfig({ cloudName: CLOUDINARY_CLOUD_NAME }));
        myImage
          .resize(thumbnail().width(80).height(80))
          .roundCorners(byRadius(5))
          .format('auto')
          .quality('auto');
        return myImage;
      } catch (error) {
        console.log(JSON.stringify(error));
        return new CloudinaryImage(publicId, new CloudConfig({ cloudName: CLOUDINARY_CLOUD_NAME }));
      }
    },
    getFullImage: (publicId: string) => {
      try {
        let myImage = new CloudinaryImage(publicId, new CloudConfig({ cloudName: CLOUDINARY_CLOUD_NAME }));
        myImage
          .format('auto')
          .quality('auto');
        return myImage;
      } catch (error) {
        console.log(JSON.stringify(error));
        return new CloudinaryImage(publicId, new CloudConfig({ cloudName: CLOUDINARY_CLOUD_NAME }));
      }
    }
  }
}
