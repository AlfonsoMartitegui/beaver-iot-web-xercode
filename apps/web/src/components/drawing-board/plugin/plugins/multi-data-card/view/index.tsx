import { type CSSProperties, useCallback, useEffect, useMemo, useState } from 'react';
import { useRequest } from 'ahooks';
import { get } from 'lodash-es';
import cls from 'classnames';

import { useI18n, useTheme } from '@milesight/shared/src/hooks';
import { Modal } from '@milesight/shared/src/components';
import * as Icons from '@milesight/shared/src/components/icons';

import { awaitWrap, entityAPI, getResponseData, isRequestSuccess } from '@/services/http';
import {
    useActivityEntity,
    useContainerRect,
    useGridLayout,
} from '@/components/drawing-board/plugin/hooks';
import { Tooltip } from '@/components/drawing-board/plugin/view-components';
import type { BoardPluginProps } from '@/components/drawing-board/plugin/types';
import type { MultiDataCardExtraItem } from '@/components/drawing-board/plugin/components';
import type { MultiDataCardControlPanelConfig } from '../control-panel';

import './style.less';

interface ViewProps {
    widgetId: ApiKey;
    dashboardId: ApiKey;
    config: MultiDataCardControlPanelConfig;
    configJson: BoardPluginProps;
}

type EntityStatus = {
    value: any;
    timestamp?: string | number;
    value_type?: EntityValueDataType;
};

type DisplayData = {
    id?: ApiKey;
    title: string;
    label?: string;
    icon?: string;
    color?: string;
    showStatusOptions?: boolean;
    statusOptions?: StatusOption[];
};

type StatusOption = {
    key: string;
    label: string;
    icon?: string;
    color?: string;
    active: boolean;
};

type FormatConfig = {
    title?: string;
    icons?: Record<string, { icon?: string; color?: string }>;
    appearanceIcon?: { icon?: string; color?: string };
    falseStatusLabel?: string;
    trueStatusLabel?: string;
    falseAppearanceIcon?: { icon?: string; color?: string };
    trueAppearanceIcon?: { icon?: string; color?: string };
    useBooleanDefaultLabel?: boolean;
    showUnavailableValue?: boolean;
    showStatusOptions?: boolean;
};

const getBooleanStatus = (value: unknown) => {
    return value === true || value === 'true' || value === 1 || value === '1';
};

const getEntityType = (entity?: EntityOptionType | null, status?: EntityStatus) => {
    return status?.value_type || entity?.rawData?.entityValueType || entity?.valueType;
};

const getEntityId = (entity?: EntityOptionType | null) => {
    return entity?.rawData?.entityId || entity?.value;
};

const getIconComponent = (icon?: string) => {
    if (!icon) return null;
    return Reflect.get(Icons, icon);
};

const View = (props: ViewProps) => {
    const { config, configJson, widgetId, dashboardId } = props;
    const { entity, extraItems = [] } = config || {};
    const { isPreview, pos, name } = configJson || {};

    const { getIntlText } = useI18n();
    const { getCSSVariableValue } = useTheme();
    const { getLatestEntityDetail, addEntityListener } = useActivityEntity();
    const { containerRef, showIconWidth } = useContainerRect();
    const { wGrid = 3, hGrid = 2 } = useGridLayout(isPreview ? { w: 3, h: 2 } : pos);
    const [statuses, setStatuses] = useState<Record<ApiKey, EntityStatus>>({});
    const [isExtraModalVisible, setIsExtraModalVisible] = useState(false);

    const latestEntity = useMemo(() => {
        if (!entity) return undefined;
        return getLatestEntityDetail(entity);
    }, [entity, getLatestEntityDetail]) as EntityOptionType | undefined;

    const latestExtraItems = useMemo(() => {
        return (extraItems || []).map(item => {
            if (!item.entity) return item;
            return {
                ...item,
                entity: getLatestEntityDetail(item.entity),
            };
        });
    }, [extraItems, getLatestEntityDetail]) as MultiDataCardExtraItem[];

    const entityIds = useMemo(() => {
        return [
            getEntityId(latestEntity),
            ...latestExtraItems.map(item => getEntityId(item.entity as EntityOptionType)),
        ].filter(Boolean) as ApiKey[];
    }, [latestEntity, latestExtraItems]);

    const { run: requestEntitiesStatus } = useRequest(
        async () => {
            if (!entityIds.length) {
                setStatuses({});
                return;
            }

            const [error, resp] = await awaitWrap(
                entityAPI.getEntitiesStatus({
                    entity_ids: entityIds,
                }),
            );
            if (error || !isRequestSuccess(resp)) return;

            setStatuses(getResponseData(resp) || {});
        },
        {
            manual: true,
            debounceWait: 300,
            refreshDeps: [entityIds],
        },
    );

    useEffect(() => {
        requestEntitiesStatus();
    }, [requestEntitiesStatus]);

    useEffect(() => {
        if (!widgetId || !dashboardId || !entityIds.length) return;

        const removeEventListener = addEntityListener(entityIds, {
            widgetId,
            dashboardId,
            callback: requestEntitiesStatus,
        });

        return () => {
            removeEventListener();
        };
    }, [entityIds, widgetId, dashboardId, addEntityListener, requestEntitiesStatus]);

    const formatEntity = useCallback(
        (
            itemEntity: EntityOptionType | undefined | null,
            status: EntityStatus | undefined,
            itemConfig: FormatConfig = {},
            titleFallback: string,
        ): DisplayData => {
            const title = itemConfig.title || titleFallback;
            const valueType = getEntityType(itemEntity, status);
            const rawValue = status?.value;
            const rawData = itemEntity?.rawData;
            const enumStruct = rawData?.entityValueAttribute?.enum;
            const unit = rawData?.entityValueAttribute?.unit;

            if (valueType === 'BOOLEAN') {
                const statusValue = getBooleanStatus(rawValue);
                const activeKey =
                    rawValue === undefined || rawValue === null
                        ? undefined
                        : statusValue
                          ? 'true'
                          : 'false';
                const customLabel = statusValue
                    ? itemConfig.trueStatusLabel
                    : itemConfig.falseStatusLabel;
                const defaultLabel =
                    rawValue === undefined
                        ? '-'
                        : getIntlText(statusValue ? 'common.label.true' : 'common.label.false');
                const shouldHideUnavailable =
                    itemConfig.showUnavailableValue === false && rawValue === undefined;
                const fallbackLabel =
                    itemConfig.useBooleanDefaultLabel === false || shouldHideUnavailable
                        ? ''
                        : defaultLabel;
                const label = customLabel || fallbackLabel;
                const appearance = statusValue
                    ? {
                          icon: itemConfig.trueAppearanceIcon?.icon,
                          color: itemConfig.trueAppearanceIcon?.color,
                      }
                    : {
                          icon: itemConfig.falseAppearanceIcon?.icon,
                          color: itemConfig.falseAppearanceIcon?.color,
                      };

                return {
                    title,
                    label,
                    ...appearance,
                    showStatusOptions: itemConfig.showStatusOptions,
                    statusOptions: [
                        {
                            key: 'false',
                            label: itemConfig.falseStatusLabel || getIntlText('common.label.false'),
                            icon: itemConfig.falseAppearanceIcon?.icon,
                            color: itemConfig.falseAppearanceIcon?.color,
                            active: activeKey === 'false',
                        },
                        {
                            key: 'true',
                            label: itemConfig.trueStatusLabel || getIntlText('common.label.true'),
                            icon: itemConfig.trueAppearanceIcon?.icon,
                            color: itemConfig.trueAppearanceIcon?.color,
                            active: activeKey === 'true',
                        },
                    ],
                };
            }

            if (enumStruct) {
                const currentKey = Object.keys(enumStruct).find(enumKey => {
                    return enumKey === rawValue?.toString();
                });
                const value = currentKey || rawValue?.toString();
                let label = itemConfig.showUnavailableValue === false ? '' : '-';

                if (currentKey) {
                    label = enumStruct[currentKey];
                } else if (value) {
                    label = value;
                }

                return {
                    title,
                    label,
                    icon: get(itemConfig.icons, `${value}.icon`) as string | undefined,
                    color: get(itemConfig.icons, `${value}.color`) as string | undefined,
                    showStatusOptions: itemConfig.showStatusOptions,
                    statusOptions: Object.keys(enumStruct).map(enumKey => ({
                        key: enumKey,
                        label: enumStruct[enumKey],
                        icon: get(itemConfig.icons, `${enumKey}.icon`) as string | undefined,
                        color: get(itemConfig.icons, `${enumKey}.color`) as string | undefined,
                        active: enumKey === currentKey,
                    })),
                };
            }

            const entityId = String(getEntityId(itemEntity) || '');
            const valueLabel = rawValue === undefined || rawValue === null ? '-' : `${rawValue}`;
            const icon =
                (get(itemConfig.icons, `${entityId}.icon`) as string | undefined) ||
                itemConfig.appearanceIcon?.icon;
            const color =
                (get(itemConfig.icons, `${entityId}.color`) as string | undefined) ||
                itemConfig.appearanceIcon?.color;
            let label = valueLabel;

            if (itemConfig.showUnavailableValue === false && valueLabel === '-') {
                label = '';
            } else if (unit && valueLabel !== '-') {
                label = `${valueLabel}${unit}`;
            }

            return {
                title,
                label,
                icon,
                color,
            };
        },
        [getIntlText],
    );

    const mainData = useMemo(() => {
        const entityId = getEntityId(latestEntity);
        return formatEntity(
            latestEntity,
            entityId ? statuses[entityId] : undefined,
            config || {},
            getIntlText(name || 'dashboard.plugin_name_multi_data_card'),
        );
    }, [latestEntity, statuses, config, getIntlText, name, formatEntity]);

    const extraData = useMemo(() => {
        return latestExtraItems
            .filter(item => Boolean(item.entity))
            .map(item => {
                const itemEntity = item.entity as EntityOptionType;
                const entityId = getEntityId(itemEntity);
                return {
                    id: item.id,
                    ...formatEntity(
                        itemEntity,
                        entityId ? statuses[entityId] : undefined,
                        {
                            ...(item as FormatConfig),
                            showUnavailableValue: false,
                            useBooleanDefaultLabel: false,
                        },
                        item.title || itemEntity?.label || getIntlText('common.label.entity'),
                    ),
                };
            });
    }, [latestExtraItems, statuses, formatEntity, getIntlText]);

    const isCompact = hGrid <= 1;
    const visibleExtraLimit = useMemo(() => {
        if (isCompact) return 1;
        if (hGrid >= 4) return extraData.length;
        if (hGrid >= 3) return 7;

        return 3;
    }, [extraData.length, hGrid, isCompact]);
    const visibleExtraCount = Math.min(extraData.length, visibleExtraLimit);
    const visibleExtraData = extraData.slice(0, visibleExtraCount);
    const hiddenExtraCount = Math.max(extraData.length - visibleExtraCount, 0);

    const renderIcon = (data: DisplayData, size: number, showBackground = false) => {
        const Icon = getIconComponent(data.icon);
        if (!Icon || !showIconWidth) return null;

        const iconColor = data.color || getCSSVariableValue('--gray-5');

        return (
            <div
                className={cls('multi-data-card-view-card__icon', {
                    'multi-data-card-view-card__icon--main': showBackground,
                })}
                style={
                    showBackground
                        ? {
                              backgroundColor: `color-mix(in srgb, ${iconColor} 14%, transparent)`,
                          }
                        : undefined
                }
            >
                <Icon
                    sx={{
                        color: iconColor,
                        fontSize: size,
                    }}
                />
            </div>
        );
    };

    const renderExtraItem = (item: DisplayData, className?: string) => {
        const showStatusOptions = item.showStatusOptions && Boolean(item.statusOptions?.length);

        if (showStatusOptions) {
            return (
                <div
                    className={cls(
                        'multi-data-card-view-card__extra-item',
                        'multi-data-card-view-card__extra-item--status-options',
                        className,
                    )}
                    key={item.id}
                >
                    <div className="multi-data-card-view-card__status-options">
                        {item.statusOptions?.map(option => {
                            const Icon = getIconComponent(option.icon);
                            const optionColor =
                                option.color || getCSSVariableValue('--text-color-secondary');

                            return (
                                <div
                                    className={cls('multi-data-card-view-card__status-option', {
                                        'multi-data-card-view-card__status-option--active':
                                            option.active,
                                    })}
                                    style={
                                        {
                                            '--status-option-color': optionColor,
                                        } as CSSProperties
                                    }
                                    key={option.key}
                                >
                                    {Icon && showIconWidth && (
                                        <Icon
                                            sx={{
                                                color: option.active
                                                    ? optionColor
                                                    : getCSSVariableValue(
                                                          '--icon-color-gray-secondary',
                                                      ),
                                                fontSize: 14,
                                            }}
                                        />
                                    )}
                                    <Tooltip
                                        className="multi-data-card-view-card__status-option-label"
                                        autoEllipsis
                                        title={option.label}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }

        return (
            <div
                className={cls('multi-data-card-view-card__extra-item', className)}
                style={{ color: item.color || getCSSVariableValue('--text-color-secondary') }}
                key={item.id}
            >
                {renderIcon(item, 16)}
                <Tooltip
                    className="multi-data-card-view-card__extra-title"
                    autoEllipsis
                    title={item.title || '-'}
                />
                {item.label && (
                    <Tooltip
                        className="multi-data-card-view-card__extra-value"
                        autoEllipsis
                        title={item.label}
                    />
                )}
            </div>
        );
    };

    return (
        <>
            <div
                ref={containerRef}
                className={cls('multi-data-card-view', {
                    'multi-data-card-view-preview': isPreview,
                })}
            >
                <div
                    className={cls('multi-data-card-view-card', {
                        'multi-data-card-view-card--compact': isCompact,
                    })}
                >
                    <div
                        className={cls('multi-data-card-view-card__content', {
                            'justify-center': isCompact,
                        })}
                    >
                        <div className="multi-data-card-view-card__header">
                            <Tooltip
                                className="multi-data-card-view-card__title"
                                autoEllipsis
                                title={mainData.title}
                            />
                        </div>
                        <div className="multi-data-card-view-card__body">
                            {renderIcon(mainData, hGrid > 1 ? 32 : 24, hGrid > 1)}
                            <div
                                className={cls('multi-data-card-view-card__data', {
                                    'text-lg': wGrid > 1 && hGrid > 1,
                                })}
                            >
                                <Tooltip autoEllipsis title={mainData.label} />
                            </div>
                        </div>
                        {(Boolean(visibleExtraData.length) || hiddenExtraCount > 0) && (
                            <div
                                className={cls('multi-data-card-view-card__extra', {
                                    'multi-data-card-view-card__extra--compact': isCompact,
                                })}
                            >
                                {visibleExtraData.map(item => renderExtraItem(item))}
                                {hiddenExtraCount > 0 && (
                                    <button
                                        className="multi-data-card-view-card__more"
                                        type="button"
                                        disabled={isPreview}
                                        onClick={() => setIsExtraModalVisible(true)}
                                    >
                                        +{hiddenExtraCount}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {!isPreview && isExtraModalVisible && (
                <Modal
                    visible
                    size="md"
                    title={mainData.title}
                    footer={null}
                    showCloseIcon
                    onCancel={() => setIsExtraModalVisible(false)}
                >
                    <div className="multi-data-card-view-modal">
                        <div className="multi-data-card-view-modal__main">
                            {renderIcon(mainData, 32)}
                            <Tooltip
                                className="multi-data-card-view-modal__main-label"
                                autoEllipsis
                                title={mainData.label}
                            />
                        </div>
                        <div className="multi-data-card-view-modal__extra">
                            {extraData.map(item =>
                                renderExtraItem(
                                    item,
                                    'multi-data-card-view-card__extra-item-modal',
                                ),
                            )}
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default View;
