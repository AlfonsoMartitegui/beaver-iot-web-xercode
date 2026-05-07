import { t } from '@milesight/shared/src/utils/tools';

import type {
    ControlPanelConfig,
    BaseControlConfig,
} from '@/components/drawing-board/plugin/types';
import type { AppearanceIconValue } from '@/components/drawing-board/plugin/components';
import StatusIndicatorIcon from '../icon.svg';

export interface StatusIndicatorControlPanelConfig {
    entity?: EntityOptionType;
    title?: string;
    normalLabel?: string;
    alarmLabel?: string;
    normalAppearanceIcon?: AppearanceIconValue;
    alarmAppearanceIcon?: AppearanceIconValue;
}

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
                            name: 'normalLabelInput',
                            config: {
                                type: 'Input',
                                label: t('dashboard.label.normal_status_label'),
                                controllerProps: {
                                    name: 'normalLabel',
                                    defaultValue: '',
                                    rules: {
                                        maxLength: 35,
                                    },
                                },
                            },
                        },
                        {
                            name: 'alarmLabelInput',
                            config: {
                                type: 'Input',
                                label: t('dashboard.label.alarm_status_label'),
                                controllerProps: {
                                    name: 'alarmLabel',
                                    defaultValue: '',
                                    rules: {
                                        maxLength: 35,
                                    },
                                },
                            },
                        },
                        {
                            name: 'appearanceOfNormalStatus',
                            config: {
                                type: 'AppearanceIcon',
                                label: t('common.label.appearance_of_status', {
                                    1: 'normal',
                                }),
                                controllerProps: {
                                    name: 'normalAppearanceIcon',
                                },
                                componentProps: {
                                    defaultValue: {
                                        icon: 'CheckCircleIcon',
                                        color: '#57B573',
                                    },
                                },
                                mapStateToProps(oldConfig, formData) {
                                    const { componentProps, ...restConfig } = oldConfig || {};
                                    return {
                                        ...restConfig,
                                        componentProps: {
                                            ...componentProps,
                                            formData,
                                        },
                                    } as BaseControlConfig<StatusIndicatorControlPanelConfig>;
                                },
                            },
                        },
                        {
                            name: 'appearanceOfAlarmStatus',
                            config: {
                                type: 'AppearanceIcon',
                                label: t('common.label.appearance_of_status', {
                                    1: 'alarm',
                                }),
                                controllerProps: {
                                    name: 'alarmAppearanceIcon',
                                },
                                componentProps: {
                                    defaultValue: {
                                        icon: 'WarningIcon',
                                        color: '#EC5D74',
                                    },
                                },
                                mapStateToProps(oldConfig, formData) {
                                    const { componentProps, ...restConfig } = oldConfig || {};
                                    return {
                                        ...restConfig,
                                        componentProps: {
                                            ...componentProps,
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
