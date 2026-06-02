import { t } from '@milesight/shared/src/utils/tools';

import type { ControlPanelConfig } from '@/components/drawing-board/plugin/types';
import type {
    AppearanceIconValue,
    MultiDataCardExtraItem,
} from '@/components/drawing-board/plugin/components';
import StatusToggleCardIcon from '../icon.svg';

const DEFAULT_FALSE_APPEARANCE: AppearanceIconValue = {
    color: '#EC5D74',
};
const DEFAULT_TRUE_APPEARANCE: AppearanceIconValue = {
    color: '#57B573',
};
const DEFAULT_FALSE_LED_COLOR = '#EC5D74';
const DEFAULT_TRUE_LED_COLOR = '#57B573';
const DEFAULT_FALSE_TOGGLE_APPEARANCE: AppearanceIconValue = {
    color: '#57B573',
};
const DEFAULT_TRUE_TOGGLE_APPEARANCE: AppearanceIconValue = {
    color: '#EC5D74',
};
const LEGACY_FALSE_TOGGLE_COLOR = '#334E9D';
const LEGACY_TRUE_TOGGLE_COLOR = '#9B9B9B';

export interface StatusToggleCardControlPanelConfig {
    entity?: EntityOptionType;
    title?: string;
    falseStatusLabel?: string;
    trueStatusLabel?: string;
    falseAppearanceIcon?: AppearanceIconValue;
    trueAppearanceIcon?: AppearanceIconValue;
    showLed?: boolean;
    falseLedColor?: string;
    trueLedColor?: string;
    falseToggleLabel?: string;
    trueToggleLabel?: string;
    falseToggleAppearanceIcon?: AppearanceIconValue;
    trueToggleAppearanceIcon?: AppearanceIconValue;
    extraItems?: MultiDataCardExtraItem[];
}

const migrateLegacyConfig = (
    update: (newData: Partial<StatusToggleCardControlPanelConfig>) => void,
    formData?: StatusToggleCardControlPanelConfig,
) => {
    if (!formData) return;

    const newData: Partial<StatusToggleCardControlPanelConfig> = {};
    const { falseToggleAppearanceIcon } = formData;
    const { trueToggleAppearanceIcon } = formData;

    if (
        falseToggleAppearanceIcon?.color === LEGACY_FALSE_TOGGLE_COLOR &&
        !falseToggleAppearanceIcon.icon
    ) {
        newData.falseToggleAppearanceIcon = DEFAULT_FALSE_TOGGLE_APPEARANCE;
    }
    if (
        trueToggleAppearanceIcon?.color === LEGACY_TRUE_TOGGLE_COLOR &&
        !trueToggleAppearanceIcon.icon
    ) {
        newData.trueToggleAppearanceIcon = DEFAULT_TRUE_TOGGLE_APPEARANCE;
    }

    if (Object.keys(newData).length) {
        update(newData);
    }
};

/**
 * The status toggle card Control Panel Config
 */
const statusToggleCardControlPanelConfig =
    (): ControlPanelConfig<StatusToggleCardControlPanelConfig> => {
        return {
            class: 'operate',
            type: 'statusToggleCard',
            name: 'dashboard.plugin_name_status_toggle_card',
            icon: StatusToggleCardIcon,
            defaultRow: 2,
            defaultCol: 4,
            minRow: 2,
            minCol: 2,
            maxRow: 4,
            maxCol: 6,
            configProps: [
                {
                    label: 'Status Toggle Card Config',
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
                                    defaultValue: t('dashboard.plugin_name_status_toggle_card'),
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
                            },
                        },
                        {
                            name: 'showLed',
                            config: {
                                type: 'Switch',
                                controllerProps: {
                                    name: 'showLed',
                                    defaultValue: true,
                                },
                                componentProps: {
                                    title: t('dashboard.label.show_led_indicator'),
                                },
                            },
                        },
                        {
                            name: 'falseLedColor',
                            config: {
                                type: 'IconColorSelect',
                                label: t('dashboard.label.false_led_color'),
                                controllerProps: {
                                    name: 'falseLedColor',
                                    defaultValue: DEFAULT_FALSE_LED_COLOR,
                                },
                                visibility(formData) {
                                    return formData?.showLed !== false;
                                },
                            },
                        },
                        {
                            name: 'trueLedColor',
                            config: {
                                type: 'IconColorSelect',
                                label: t('dashboard.label.true_led_color'),
                                controllerProps: {
                                    name: 'trueLedColor',
                                    defaultValue: DEFAULT_TRUE_LED_COLOR,
                                },
                                visibility(formData) {
                                    return formData?.showLed !== false;
                                },
                            },
                        },
                        {
                            name: 'falseToggleLabelInput',
                            config: {
                                type: 'Input',
                                label: t('dashboard.label.false_toggle_button_label'),
                                controllerProps: {
                                    name: 'falseToggleLabel',
                                    defaultValue: '',
                                    rules: {
                                        maxLength: 35,
                                    },
                                },
                            },
                        },
                        {
                            name: 'trueToggleLabelInput',
                            config: {
                                type: 'Input',
                                label: t('dashboard.label.true_toggle_button_label'),
                                controllerProps: {
                                    name: 'trueToggleLabel',
                                    defaultValue: '',
                                    rules: {
                                        maxLength: 35,
                                    },
                                },
                            },
                        },
                        {
                            name: 'appearanceOfFalseToggle',
                            config: {
                                type: 'AppearanceIcon',
                                label: t('dashboard.label.false_toggle_button_appearance'),
                                controllerProps: {
                                    name: 'falseToggleAppearanceIcon',
                                },
                                componentProps: {
                                    defaultValue: DEFAULT_FALSE_TOGGLE_APPEARANCE,
                                    allowEmptyIcon: true,
                                },
                            },
                        },
                        {
                            name: 'appearanceOfTrueToggle',
                            config: {
                                type: 'AppearanceIcon',
                                label: t('dashboard.label.true_toggle_button_appearance'),
                                controllerProps: {
                                    name: 'trueToggleAppearanceIcon',
                                },
                                componentProps: {
                                    defaultValue: DEFAULT_TRUE_TOGGLE_APPEARANCE,
                                    allowEmptyIcon: true,
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
                                    allowEmptyIcon: true,
                                    showStatusOptionsControl: false,
                                    maxCount: 4,
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

export default statusToggleCardControlPanelConfig;
