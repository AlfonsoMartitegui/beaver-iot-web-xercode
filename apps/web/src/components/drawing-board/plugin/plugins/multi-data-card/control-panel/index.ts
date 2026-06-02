import { t } from '@milesight/shared/src/utils/tools';

import type {
    BaseControlConfig,
    ControlPanelConfig,
} from '@/components/drawing-board/plugin/types';
import type {
    AppearanceIconValue,
    MultiDataCardExtraItem,
} from '@/components/drawing-board/plugin/components';
import MultiDataCardIcon from '../icon.svg';

export interface MultiDataCardControlPanelConfig {
    entity?: EntityOptionType;
    title?: string;
    icons?: Record<string, AppearanceIconValue>;
    falseStatusLabel?: string;
    trueStatusLabel?: string;
    falseAppearanceIcon?: AppearanceIconValue;
    trueAppearanceIcon?: AppearanceIconValue;
    extraItems?: MultiDataCardExtraItem[];
}

const isBooleanEntity = (entity?: EntityOptionType) => {
    return entity?.rawData?.entityValueType === 'BOOLEAN' || entity?.valueType === 'BOOLEAN';
};

/**
 * The multi data card Control Panel Config
 */
const multiDataCardControlPanelConfig = (): ControlPanelConfig<MultiDataCardControlPanelConfig> => {
    return {
        class: 'data_card',
        type: 'multiDataCard',
        name: 'dashboard.plugin_name_multi_data_card',
        icon: MultiDataCardIcon,
        defaultRow: 2,
        defaultCol: 3,
        minRow: 1,
        minCol: 2,
        maxRow: 4,
        maxCol: 4,
        configProps: [
            {
                label: 'Multi Data Card Config',
                controlSetItems: [
                    {
                        name: 'entitySelect',
                        config: {
                            type: 'EntitySelect',
                            label: t('common.label.entity'),
                            controllerProps: {
                                name: 'entity',
                                rules: {
                                    required: true,
                                },
                            },
                            componentProps: {
                                required: true,
                                entityType: ['PROPERTY'],
                                entityValueType: ['STRING', 'LONG', 'DOUBLE', 'BOOLEAN'],
                                entityAccessMod: ['R', 'RW'],
                            },
                        },
                    },
                    {
                        name: 'input',
                        config: {
                            type: 'Input',
                            label: t('common.label.title'),
                            controllerProps: {
                                name: 'title',
                                defaultValue: t('dashboard.plugin_name_multi_data_card'),
                                rules: {
                                    maxLength: 35,
                                },
                            },
                        },
                    },
                    {
                        name: 'falseStatusLabelInput',
                        config: {
                            type: 'Input',
                            label: t('dashboard.label.false_status_label'),
                            controllerProps: {
                                name: 'falseStatusLabel',
                                defaultValue: '',
                                rules: {
                                    maxLength: 35,
                                },
                            },
                            visibility(formData) {
                                return isBooleanEntity(formData?.entity);
                            },
                        },
                    },
                    {
                        name: 'trueStatusLabelInput',
                        config: {
                            type: 'Input',
                            label: t('dashboard.label.true_status_label'),
                            controllerProps: {
                                name: 'trueStatusLabel',
                                defaultValue: '',
                                rules: {
                                    maxLength: 35,
                                },
                            },
                            visibility(formData) {
                                return isBooleanEntity(formData?.entity);
                            },
                        },
                    },
                    {
                        name: 'appearanceOfFalseStatus',
                        config: {
                            type: 'AppearanceIcon',
                            label: t('dashboard.label.false_status_appearance'),
                            controllerProps: {
                                name: 'falseAppearanceIcon',
                            },
                            visibility(formData) {
                                return isBooleanEntity(formData?.entity);
                            },
                        },
                    },
                    {
                        name: 'appearanceOfTrueStatus',
                        config: {
                            type: 'AppearanceIcon',
                            label: t('dashboard.label.true_status_appearance'),
                            controllerProps: {
                                name: 'trueAppearanceIcon',
                            },
                            visibility(formData) {
                                return isBooleanEntity(formData?.entity);
                            },
                        },
                    },
                    {
                        name: 'multiAppearanceIcon',
                        config: {
                            type: 'MultiAppearanceIcon',
                            controllerProps: {
                                name: 'icons',
                            },
                            visibility(formData) {
                                return (
                                    Boolean(formData?.entity) && !isBooleanEntity(formData?.entity)
                                );
                            },
                            mapStateToProps(oldConfig, formData) {
                                const { componentProps, ...restConfig } = oldConfig || {};
                                return {
                                    ...restConfig,
                                    componentProps: {
                                        ...componentProps,
                                        formData,
                                    },
                                } as BaseControlConfig<MultiDataCardControlPanelConfig>;
                            },
                        },
                    },
                    {
                        name: 'extraItems',
                        config: {
                            type: 'MultiDataCardExtraItems',
                            controllerProps: {
                                name: 'extraItems',
                                defaultValue: [],
                            },
                            componentProps: {
                                maxCount: 10,
                                entityType: ['PROPERTY' as EntityType],
                                entityValueType: [
                                    'STRING' as EntityValueDataType,
                                    'LONG' as EntityValueDataType,
                                    'DOUBLE' as EntityValueDataType,
                                    'BOOLEAN' as EntityValueDataType,
                                ],
                                entityAccessMod: [
                                    'R' as EntityAccessMode,
                                    'RW' as EntityAccessMode,
                                ],
                            },
                        },
                    },
                ],
            },
        ],
    };
};

export default multiDataCardControlPanelConfig;
