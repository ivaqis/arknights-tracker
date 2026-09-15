import type { ParamBoxProps } from "$lib/components/dataToolbarV2/paramBoxes/ParamBoxProps";
import type { ParamId } from "$lib/components/dataToolbarV2/paramBoxes/ParamId";

export interface TextParamBoxProps<TParam extends ParamId = ParamId> extends ParamBoxProps {
    paramId: TParam;
    getLocaleFunc: ((param: TParam) => string) | undefined;
}