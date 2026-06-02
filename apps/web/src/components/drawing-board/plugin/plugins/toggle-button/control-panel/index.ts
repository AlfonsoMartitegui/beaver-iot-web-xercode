import { t } from '@milesight/shared/src/utils/tools';

import type {
    ControlPanelConfig,
    BaseControlConfig,
} from '@/components/drawing-board/plugin/types';
import type { AppearanceIconValue } from '@/components/drawing-board/plugin/components';
import ToggleButtonIcon from '../icon.svg';

const DEFAULT_FALSE_APPEARANCE: AppearanceIconValue = {
    icon: 'IotSwitchOffIcon',
    color: '#9B9B9B',
};
const DEFAULT_TRUE_APPEARANCE: AppearanceIconValue = {
    icon: 'IotSwitchOnIcon',
    color: '#334E9D',
};

export interface ToggleButtonControlPanelConfig {
    entity?: EntityOptionType;
    title?: string;
    falseLabel?: string;
    trueLabel?: string;
    falseAppearanceIcon?: AppearanceIconValue;
    trueAppearanceIcon?: AppearanceIconValue;
    /** @deprecated Use trueAppearanceIcon instead. */
    onAppearanceIcon?: AppearanceIconValue;
    /** @deprecated Use falseAppearanceIcon instead. */
    offAppearanceIcon?: AppearanceIconValue;
}

const migrateLegacyConfig = (
    update: (newData: Partial<ToggleButtonControlPanelConfig>) => void,
    formData?: ToggleButtonControlPanelConfig,
) => {
    if (!formData) return;

    const newData: Partial<ToggleButtonControlPanelConfig> = {};

    if (!formData.falseAppearanceIcon && formData.offAppearanceIcon) {
        newData.falseAppearanceIcon = formData.offAppearanceIcon;
    }
    if (!formData.trueAppearanceIcon && formData.onAppearanceIcon) {
        newData.trueAppearanceIcon = formData.onAppearanceIcon;
    }

    if (Object.keys(newData).length) {
        update(newData);
    }
};

/**
 * The toggle button Control Panel Config
 */
const toggleButtonControlPanelConfig = (): ControlPanelConfig<ToggleButtonControlPanelConfig> => {
    return {
        class: 'operate',
        type: 'toggleButton',
        name: 'dashboard.plugin_name_toggle_button',
        icon: ToggleButtonIcon,
        defaultRow: 1,
        defaultCol: 2,
        minRow: 1,
        minCol: 1,
        maxRow: 1,
        maxCol: 4,
        configProps: [
            {
                label: 'Toggle Button Config',
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
                                entityAccessMod: ['W', 'RW'],
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
                                defaultValue: t('dashboard.plugin_name_toggle_button'),
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
                                allowEmptyIcon: true,
                            },
                            mapStateToProps(oldConfig, formData) {
                                const { componentProps, ...restConfig } = oldConfig || {};
                                return {
                                    ...restConfig,
                                    componentProps: {
                                        ...componentProps,
                                        defaultValue:
                                            formData?.falseAppearanceIcon ||
                                            formData?.offAppearanceIcon ||
                                            DEFAULT_FALSE_APPEARANCE,
                                        formData,
                                    },
                                } as BaseControlConfig<ToggleButtonControlPanelConfig>;
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
                                allowEmptyIcon: true,
                            },
                            mapStateToProps(oldConfig, formData) {
                                const { componentProps, ...restConfig } = oldConfig || {};
                                return {
                                    ...restConfig,
                                    componentProps: {
                                        ...componentProps,
                                        defaultValue:
                                            formData?.trueAppearanceIcon ||
                                            formData?.onAppearanceIcon ||
                                            DEFAULT_TRUE_APPEARANCE,
                                        formData,
                                    },
                                } as BaseControlConfig<ToggleButtonControlPanelConfig>;
                            },
                        },
                    },
                ],
            },
        ],
    };
};

export default toggleButtonControlPanelConfig;
