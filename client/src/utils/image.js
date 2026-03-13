const CLOUDINARY_SEGMENT = "/upload/";

export const transformCloudinaryImage = (url, options = {}) => {
  if (!url || typeof url !== "string" || !url.includes("res.cloudinary.com")) {
    return url;
  }

  const {
    width,
    height,
    crop = "fill",
    quality = "auto",
    format = "auto",
  } = options;

  const transforms = [`f_${format}`, `q_${quality}`];

  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (width || height) transforms.push(`c_${crop}`);

  const transformString = transforms.join(",");
  return url.replace(
    CLOUDINARY_SEGMENT,
    `${CLOUDINARY_SEGMENT}${transformString}/`,
  );
};
