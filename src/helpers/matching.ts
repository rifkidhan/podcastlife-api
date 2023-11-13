export const integer = (param: string): boolean => {
	const reg = /^\d+$/;

	return reg.test(param);
};
