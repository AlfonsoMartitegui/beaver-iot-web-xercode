import { type CSSProperties, useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounceFn, useRequest } from 'ahooks';
import { get } from 'lodash-es';
import cls from 'classnames';

import { useI18n, useTheme } from '@milesight/shared/src/hooks';
import { Modal } from '@milesight/shared/src/components';
import * as Icons from '@milesight/shared/src/components/icons';
import {
    useActivityEntity,
    useContainerRect,
    useGridLayout,
} from '@/components/drawing-board/plugin/hooks';
import { Tooltip } from '@/components/drawing-board/plugin/view-components';
import { awaitWrap, entityAPI, getResponseData, isRequestSuccess } from '@/services/http';
import type { BoardPluginProps } from '@/components/drawing-board/plugin/types';
import type { MultiDataCardExtraItem } from '@/components/drawing-board/plugin/components';
import type { StatusToggleCardControlPanelConfig } from '../control-panel';

import './style.less';

interface ViewProps {
    widgetId: ApiKey;
    dashboardId: ApiKey;
    config: StatusToggleCardControlPanelConfig;
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
};

type FormatConfig = {
    title?: string;
    icons?: Record<string, { icon?: string; color?: string }>;
    appearanceIcon?: { icon?: string; color?: string };
    falseStatusLabel?: string;
    trueStatusLabel?: string;
    falseAppearanceIcon?: { icon?: string; color?: string };
    trueAppearanceIcon?: { icon?: string; color?: string };
    showUnavailableValue?: boolean;
};

type DefaultAppearance = {
    icon?: string;
    color: string;
};

const DEFAULT_FALSE_APPEARANCE: DefaultAppearance = {
    color: '#EC5D74',
};
const DEFAULT_TRUE_APPEARANCE: DefaultAppearance = {
    color: '#57B573',
};
const DEFAULT_FALSE_LED_COLOR = '#EC5D74';
const DEFAULT_TRUE_LED_COLOR = '#57B573';
const DEFAULT_FALSE_TOGGLE_APPEARANCE: DefaultAppearance = {
    color: '#57B573',
};
const DEFAULT_TRUE_TOGGLE_APPEARANCE: DefaultAppearance = {
    color: '#EC5D74',
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
    const {
        entity,
        title,
        falseStatusLabel,
        trueStatusLabel,
        showLed,
        falseLedColor,
        trueLedColor,
        falseToggleLabel,
        trueToggleLabel,
        extraItems = [],
    } = config || {};
    const { isPreview, name, pos } = configJson || {};

    const { getIntlText } = useI18n();
    const { getCSSVariableValue } = useTheme();
    const { getLatestEntityDetail, addEntityListener } = useActivityEntity();
    const { containerRef, showIconWidth } = useContainerRect();
    const { hGrid = 2 } = useGridLayout(isPreview ? { w: 4, h: 2 } : pos);
    const [statuses, setStatuses] = useState<Record<ApiKey, EntityStatus>>({});
    const [isExtraModalVisible, setIsExtraModalVisible] = useState(false);

    const latestEntity = useMemo(() => {
        if (!entity) return undefined;
        return getLatestEntityDetail(entity);
    }, [entity, getLatestEntityDetail]) as EntityOptionType | undefined;

    const latestExtraItems = useMemo(() => {
        return (extraItems || []).slice(0, 4).map(item => {
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

    const mainEntityId = getEntityId(latestEntity);
    const mainStatus = mainEntityId ? statuses[mainEntityId] : undefined;
    const statusValue = getBooleanStatus(mainStatus?.value);

    const handleEntityStatus = useCallback(
        async (toggleVal: boolean) => {
            const entityKey = latestEntity?.rawData?.entityKey;

            if (!entityKey || Boolean(isPreview)) return;

            entityAPI.updateProperty({
                exchange: { [entityKey]: toggleVal },
            });
        },
        [latestEntity, isPreview],
    );

    const { run: handleToggleChange } = useDebounceFn(
        () => {
            const nextValue = !statusValue;

            setStatuses(oldStatuses => {
                if (!mainEntityId) return oldStatuses;
                return {
                    ...oldStatuses,
                    [mainEntityId]: {
                        ...oldStatuses[mainEntityId],
                        value: nextValue,
                    },
                };
            });
            handleEntityStatus(nextValue);
        },
        { wait: 300 },
    );

    const formatEntity = useCallback(
        (
            itemEntity: EntityOptionType | undefined | null,
            status: EntityStatus | undefined,
            itemConfig: FormatConfig = {},
            titleFallback: string,
        ): DisplayData => {
            const itemTitle = itemConfig.title || titleFallback;
            const valueType = getEntityType(itemEntity, status);
            const rawValue = status?.value;
            const rawData = itemEntity?.rawData;
            const enumStruct = rawData?.entityValueAttribute?.enum;
            const unit = rawData?.entityValueAttribute?.unit;

            if (valueType === 'BOOLEAN') {
                const itemStatusValue = getBooleanStatus(rawValue);
                const customLabel = itemStatusValue
                    ? itemConfig.trueStatusLabel
                    : itemConfig.falseStatusLabel;
                const defaultLabel =
                    rawValue === undefined
                        ? '-'
                        : getIntlText(itemStatusValue ? 'common.label.true' : 'common.label.false');
                const label =
                    itemConfig.showUnavailableValue === false && rawValue === undefined
                        ? ''
                        : customLabel || defaultLabel;
                const appearance = itemStatusValue
                    ? {
                          icon: itemConfig.trueAppearanceIcon?.icon,
                          color: itemConfig.trueAppearanceIcon?.color,
                      }
                    : {
                          icon: itemConfig.falseAppearanceIcon?.icon,
                          color: itemConfig.falseAppearanceIcon?.color,
                      };

                return {
                    title: itemTitle,
                    label,
                    ...appearance,
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
                    title: itemTitle,
                    label,
                    icon: get(itemConfig.icons, `${value}.icon`) as string | undefined,
                    color: get(itemConfig.icons, `${value}.color`) as string | undefined,
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
                title: itemTitle,
                label,
                icon,
                color,
            };
        },
        [getIntlText],
    );

    const displayTitle = useMemo(() => {
        return title || getIntlText(name || 'dashboard.plugin_name_status_toggle_card');
    }, [getIntlText, name, title]);

    const displayLabel = useMemo(() => {
        return (
            (statusValue ? trueStatusLabel : falseStatusLabel) ||
            getIntlText(statusValue ? 'common.label.true' : 'common.label.false')
        );
    }, [falseStatusLabel, getIntlText, statusValue, trueStatusLabel]);

    const headerAppearance = useMemo(() => {
        return statusValue
            ? {
                  icon: get(config, 'trueAppearanceIcon.icon') ?? DEFAULT_TRUE_APPEARANCE.icon,
                  color: get(config, 'trueAppearanceIcon.color', DEFAULT_TRUE_APPEARANCE.color),
              }
            : {
                  icon: get(config, 'falseAppearanceIcon.icon') ?? DEFAULT_FALSE_APPEARANCE.icon,
                  color: get(config, 'falseAppearanceIcon.color', DEFAULT_FALSE_APPEARANCE.color),
              };
    }, [statusValue, config]);

    const toggleAppearance = useMemo(() => {
        return statusValue
            ? {
                  label: trueToggleLabel || getIntlText('common.label.true'),
                  icon:
                      get(config, 'trueToggleAppearanceIcon.icon') ??
                      DEFAULT_TRUE_TOGGLE_APPEARANCE.icon,
                  color: get(
                      config,
                      'trueToggleAppearanceIcon.color',
                      DEFAULT_TRUE_TOGGLE_APPEARANCE.color,
                  ),
              }
            : {
                  label: falseToggleLabel || getIntlText('common.label.false'),
                  icon:
                      get(config, 'falseToggleAppearanceIcon.icon') ??
                      DEFAULT_FALSE_TOGGLE_APPEARANCE.icon,
                  color: get(
                      config,
                      'falseToggleAppearanceIcon.color',
                      DEFAULT_FALSE_TOGGLE_APPEARANCE.color,
                  ),
              };
    }, [config, falseToggleLabel, getIntlText, statusValue, trueToggleLabel]);

    const ledColor = statusValue
        ? trueLedColor || DEFAULT_TRUE_LED_COLOR
        : falseLedColor || DEFAULT_FALSE_LED_COLOR;
    const headerColor = headerAppearance.color || getCSSVariableValue('--gray-5');

    const HeaderIcon = useMemo(() => {
        const Icon = getIconComponent(headerAppearance.icon);
        if (!Icon) return null;

        return <Icon sx={{ color: headerColor }} />;
    }, [headerAppearance.icon, headerColor]);

    const ToggleIcon = useMemo(() => {
        const Icon = getIconComponent(toggleAppearance.icon);
        if (!Icon) return null;

        return <Icon sx={{ color: 'var(--white)', fontSize: 16 }} />;
    }, [toggleAppearance.icon]);

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
                        },
                        item.title || itemEntity?.label || getIntlText('common.label.entity'),
                    ),
                };
            });
    }, [formatEntity, getIntlText, latestExtraItems, statuses]);

    const isCompactExtra = hGrid < 3;
    const visibleExtraLimit = hGrid < 2 ? 0 : hGrid < 3 ? 2 : extraData.length;
    const visibleExtraCount = Math.min(extraData.length, visibleExtraLimit);
    const visibleExtraData = extraData.slice(0, visibleExtraCount);
    const hiddenExtraCount = Math.max(extraData.length - visibleExtraCount, 0);
    const hasExtra = extraData.length > 0;
    const isCompactCard = hGrid <= 1;
    const isDenseExtraCard = isCompactExtra && hasExtra;

    const renderExtraIcon = (data: DisplayData) => {
        const Icon = getIconComponent(data.icon);
        if (!Icon || !showIconWidth) return null;

        return (
            <Icon
                sx={{
                    color: data.color || getCSSVariableValue('--text-color-secondary'),
                    fontSize: isCompactExtra ? 14 : 16,
                }}
            />
        );
    };

    const renderExtraItem = (item: DisplayData, className?: string) => {
        return (
            <div
                className={cls('status-toggle-card-view-card__extra-item', className)}
                key={item.id}
            >
                <div className="status-toggle-card-view-card__extra-title-row">
                    {renderExtraIcon(item)}
                    <Tooltip
                        className="status-toggle-card-view-card__extra-title"
                        autoEllipsis
                        title={item.title || '-'}
                    />
                </div>
                {item.label && (
                    <Tooltip
                        className="status-toggle-card-view-card__extra-value"
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
                className={cls('status-toggle-card-view', {
                    'status-toggle-card-view-preview': isPreview,
                })}
            >
                <div
                    className={cls('status-toggle-card-view-card', {
                        'status-toggle-card-view-card--compact': isCompactCard,
                        'status-toggle-card-view-card--dense-extra': isDenseExtraCard,
                        'status-toggle-card-view-card--no-extra': !hasExtra,
                    })}
                >
                    <div className="status-toggle-card-view-card__header">
                        {showIconWidth && HeaderIcon && (
                            <div
                                className="status-toggle-card-view-card__icon"
                                style={{
                                    backgroundColor: `color-mix(in srgb, ${headerColor} 14%, transparent)`,
                                }}
                            >
                                {HeaderIcon}
                            </div>
                        )}
                        <div className="status-toggle-card-view-card__content">
                            <Tooltip
                                className="status-toggle-card-view-card__title"
                                autoEllipsis
                                title={displayTitle}
                            />
                            <Tooltip
                                className="status-toggle-card-view-card__value"
                                autoEllipsis
                                title={displayLabel}
                            />
                        </div>
                        {showLed !== false && (
                            <div
                                className="status-toggle-card-view-card__led"
                                style={{
                                    backgroundColor: ledColor,
                                    boxShadow: `0 0 0 4px color-mix(in srgb, ${ledColor} 12%, transparent)`,
                                }}
                            />
                        )}
                    </div>
                    {(Boolean(visibleExtraData.length) || hiddenExtraCount > 0) && (
                        <div
                            className={cls('status-toggle-card-view-card__extra', {
                                'status-toggle-card-view-card__extra--compact': isCompactExtra,
                                'status-toggle-card-view-card__extra--has-more':
                                    hiddenExtraCount > 0,
                            })}
                        >
                            {visibleExtraData.map(item => renderExtraItem(item))}
                            {hiddenExtraCount > 0 && (
                                <button
                                    className="status-toggle-card-view-card__more"
                                    type="button"
                                    disabled={isPreview}
                                    onClick={() => setIsExtraModalVisible(true)}
                                >
                                    +{hiddenExtraCount}
                                </button>
                            )}
                        </div>
                    )}
                    <button
                        className="status-toggle-card-view-card__button"
                        type="button"
                        disabled={Boolean(isPreview)}
                        onClick={handleToggleChange}
                        style={
                            {
                                '--toggle-button-color': toggleAppearance.color,
                            } as CSSProperties
                        }
                    >
                        {ToggleIcon}
                        <Tooltip
                            className="status-toggle-card-view-card__button-label"
                            autoEllipsis
                            title={toggleAppearance.label}
                        />
                    </button>
                </div>
            </div>
            {!isPreview && isExtraModalVisible && (
                <Modal
                    visible
                    size="md"
                    title={displayTitle}
                    footer={null}
                    showCloseIcon
                    onCancel={() => setIsExtraModalVisible(false)}
                >
                    <div className="status-toggle-card-view-modal">
                        <div className="status-toggle-card-view-modal__extra">
                            {extraData.map(item =>
                                renderExtraItem(
                                    item,
                                    'status-toggle-card-view-card__extra-item-modal',
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
