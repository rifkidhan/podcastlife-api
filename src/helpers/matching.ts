export const integer = (param: string): boolean => {
	const reg = /^\d+$/;

	return reg.test(param);
};

export const language =
	"in,en,en-au,en-bz,en-ca,en-ie,en-jm,en-nz,en-ph,en-za,en-tt,en-gb,en-us,en-zw";
