import {
  ImageMagick,
  initializeImageMagick,
  MagickFormat,
  MagickGeometry,
} from "magick";
import { Percentage } from "magick";
import { encodeBase64 } from "@std/encoding";

export async function initialize() {
  const wasmUrl =
    "https://esm.sh/@imagemagick/magick-wasm@0.0.30/dist/magick.wasm";

  const response = await fetch(wasmUrl);
  await initializeImageMagick(new Int8Array(await response.arrayBuffer()));
}

/**
 * Transform image to data uri image.
 *
 * @returns png base64 string without "data:image/png;base64,"
 */
export async function transform(
  url: string | undefined | null,
): Promise<string | null> {
  if (typeof url === "undefined" || url === "" || url === null) return null;

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(50000) });

    if (response.ok) {
      const imageFile = await response.arrayBuffer();

      const imageTransform = await getImageData(
        new Uint8Array(imageFile),
      ).catch((e) => {
        console.log(e);

        return null;
      });

      if (!imageTransform) return null;

      const result = encodeBase64(imageTransform);
      return result;
    }

    return null;
  } catch (error) {
    console.error(error);

    return null;
  }
}

const getImageData = (source: Uint8Array) => {
  const size = new MagickGeometry(8);
  size.fillArea = true;

  return new Promise<Uint8Array>((resolve) => {
    ImageMagick.read(source, (image) => {
      image.resize(size);
      image.modulate(new Percentage(110), new Percentage(120));
      image.adaptiveBlur(4);
      image.normalize();
      image.write(MagickFormat.Png, (data) => resolve(data));
    });
  });
};
