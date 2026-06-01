import { t } from '@milesight/shared/src/utils/tools';

import type {
    ControlPanelConfig,
    BaseControlConfig,
} from '@/components/drawing-board/plugin/types';
import type { AppearanceIconValue } from '@/components/drawing-board/plugin/components';
import StatusIndicatorIcon from '../icon.svg';

const DEFAULT_FALSE_APPEARANCE: AppearanceIconValue = {
    icon: 'CheckCircleIcon',
    color: '#57B573',
};
const DEFAULT_TRUE_APPEARANCE: AppearanceIconValue = {
    icon: 'WarningIcon',
    color: '#EC5D74',
};

export interface StatusIndicatorControlPanelConfig {
    entity?: EntityOptionType;
    title?: string;
    falseLabel?: string;
    trueLabel?: string;
    falseAppearanceIcon?: AppearanceIconValue;
    trueAppearanceIcon?: AppearanceIconValue;
    /** @deprecated Use falseLabel instead. */
    normalLabel?: string;
    /** @deprecated Use trueLabel instead. */
    alarmLabel?: string;
    /** @deprecated Use falseAppearanceIcon instead. */
    normalAppearanceIcon?: AppearanceIconValue;
    /** @deprecated Use trueAppearanceIcon instead. */
    alarmAppearanceIcon?: AppearanceIconValue;
}

const migrateLegacyConfig = (
    update: (newData: Partial<StatusIndicatorControlPanelConfig>) => void,
    formData?: StatusIndicatorControlPanelConfig,
) => {
    if (!formData) return;

    const newData: Partial<StatusIndicatorControlPanelConfig> = {};

    if (!formData.falseLabel && formData.normalLabel) {
        newData.falseLabel = formData.normalLabel;
    }
    if (!formData.trueLabel && formData.alarmLabel) {
        newData.trueLabel = formData.alarmLabel;
    }
    if (!formData.falseAppearanceIcon && formData.normalAppearanceIcon) {
        newData.falseAppearanceIcon = formData.normalAppearanceIcon;
    }
    if (!formData.trueAppearanceIcon && formData.alarmAppearanceIcon) {
        newData.trueAppearanceIcon = formData.alarmAppearanceIcon;
    }

    if (Object.keys(newData).length) {
        update(newData);
    }
};

/**
 * The status indicator Control Panel Config
 */
const statusIndicatorControlPanelConfig =
    (): ControlPanelConfig<StatusIndicatorControlPanelConfig> => {
        return {
            class: 'data_card',
            type: 'statusIndicator',
            name: 'dashboard.plugin_name_status_indicator',
            icon: StatusIndicatorIcon,
            defaultRow: 1,
            defaultCol: 2,
            minRow: 1,
            minCol: 1,
            maxRow: 2,
            maxCol: 2,
            configProps: [
                {
                    label: 'Status Indicator Config',
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
                                setValuesToFormConfig: migrateLegacyConfig,
                                componentProps: {
                                    required: true,
                                    entityType: ['PROPERTY'],
                                    entityValueType: ['BOOLEAN'],
                                    entityAccessMod: ['R', 'RW'],
                                    excludeChildren: true,
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
                                    defaultValue: '',
                                    rules: {
                                        maxLength: 35,
                                    },
                                },
                            },
                        },
                        {
                            name: 'falseLabelInput',
                            config: {
                                type: 'Input',
                                label: t('dashboard.label.false_status_label'),
                                controllerProps: {
                                    name: 'falseLabel',
                                    defaultValue: '',
                                    rules: {
                                        maxLength: 35,
                                    },
                                },
                            },
                        },
                        {
                            name: 'trueLabelInput',
                            config: {
                                type: 'Input',
                                label: t('dashboard.label.true_status_label'),
                                controllerProps: {
                                    name: 'trueLabel',
                                    defaultValue: '',
                                    rules: {
                                        maxLength: 35,
                                    },
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
                                componentProps: {
                                    defaultValue: DEFAULT_FALSE_APPEARANCE,
                                },
                                mapStateToProps(oldConfig, formData) {
                                    const { componentProps, ...restConfig } = oldConfig || {};
                                    return {
                                        ...restConfig,
                                        componentProps: {
                                            ...componentProps,
                                            defaultValue:
                                                formData?.falseAppearanceIcon ||
                                                formData?.normalAppearanceIcon ||
                                                DEFAULT_FALSE_APPEARANCE,
                                            formData,
                                        },
                                    } as BaseControlConfig<StatusIndicatorControlPanelConfig>;
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
                                componentProps: {
                                    defaultValue: DEFAULT_TRUE_APPEARANCE,
                                },
                                mapStateToProps(oldConfig, formData) {
                                    const { componentProps, ...restConfig } = oldConfig || {};
                                    return {
                                        ...restConfig,
                                        componentProps: {
                                            ...componentProps,
                                            defaultValue:
                                                formData?.trueAppearanceIcon ||
                                                formData?.alarmAppearanceIcon ||
                                                DEFAULT_TRUE_APPEARANCE,
                                            formData,
                                        },
                                    } as BaseControlConfig<StatusIndicatorControlPanelConfig>;
                                },
                            },
                        },
                    ],
                },
            ],
        };
    };

export default statusIndicatorControlPanelConfig;
