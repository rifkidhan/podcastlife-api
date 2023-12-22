import {
  ImageMagick,
  MagickFormat,
  MagickGeometry,
  Percentage,
} from "https://deno.land/x/imagemagick_deno@0.0.26/mod.ts";

const getData = (data: Uint8Array) => {
  return new Promise<string>((resolve) => {
    ImageMagick.read(data, (img) => {
      const size = new MagickGeometry(8);
      size.fillArea = true;
      const brightness = new Percentage(100);
      const saturation = new Percentage(130);

      img.resize(size);
      img.format = MagickFormat.Png;
      img.modulate(brightness, saturation);
      img.blur();

      img.normalize();
      img.write(img.format, (write) => {
        const base64 = String.fromCodePoint(...write);

        const result = `data:image/${img.format.toLowerCase()};base64,${btoa(
          base64
        )}`;
        resolve(result);
      });
    });
  });
};

export const getBlurData = async (url: string) => {
  const res = await fetch(url).then((res) => res.arrayBuffer());

  const data = new Uint8Array(res);

  const resData = await getData(data);

  return resData;
};
