import { t } from '@milesight/shared/src/utils/tools';

import type { ControlPanelConfig } from '@/components/drawing-board/plugin/types';
import type { AppearanceIconValue } from '@/components/drawing-board/plugin/components';
import StatusCardIcon from '../icon.svg';

const DEFAULT_FALSE_APPEARANCE: AppearanceIconValue = {
    icon: 'IotDoorCloseIcon',
    color: '#57B573',
};
const DEFAULT_TRUE_APPEARANCE: AppearanceIconValue = {
    icon: 'IotDoorOpenIcon',
    color: '#EC5D74',
};
const DEFAULT_FALSE_LED_COLOR = '#57B573';
const DEFAULT_TRUE_LED_COLOR = '#EC5D74';

export interface StatusCardControlPanelConfig {
    entity?: EntityOptionType;
    title?: string;
    falseStatusLabel?: string;
    trueStatusLabel?: string;
    /** @deprecated Use falseStatusLabel instead. */
    falseLabel?: string;
    /** @deprecated Use trueStatusLabel instead. */
    trueLabel?: string;
    falseAppearanceIcon?: AppearanceIconValue;
    trueAppearanceIcon?: AppearanceIconValue;
    showLed?: boolean;
    falseLedColor?: string;
    trueLedColor?: string;
}

/**
 * The status card Control Panel Config
 */
const statusCardControlPanelConfig = (): ControlPanelConfig<StatusCardControlPanelConfig> => {
    return {
        class: 'data_card',
        type: 'statusCard',
        name: 'dashboard.plugin_name_status_card',
        icon: StatusCardIcon,
        defaultRow: 1,
        defaultCol: 2,
        minRow: 1,
        minCol: 2,
        maxRow: 2,
        maxCol: 4,
        configProps: [
            {
                label: 'Status Card Config',
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
                ],
            },
        ],
    };
};

export default statusCardControlPanelConfig;
