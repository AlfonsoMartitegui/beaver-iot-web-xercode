import { useMemo, useState, useEffect } from 'react';
import { useRequest } from 'ahooks';
import { get } from 'lodash-es';
import cls from 'classnames';

import { useI18n, useTheme } from '@milesight/shared/src/hooks';
import * as Icons from '@milesight/shared/src/components/icons';

import { entityAPI, awaitWrap, isRequestSuccess, getResponseData } from '@/services/http';
import { useActivityEntity, useContainerRect } from '../../../hooks';
import { Tooltip } from '../../../view-components';
import type { BoardPluginProps } from '../../../types';
import type { StatusCardControlPanelConfig } from '../control-panel';

import './style.less';

interface ViewProps {
    widgetId: ApiKey;
    dashboardId: ApiKey;
    config: StatusCardControlPanelConfig;
    configJson: BoardPluginProps;
}

const DEFAULT_FALSE_APPEARANCE = {
    icon: 'CheckCircleIcon',
    color: '#57B573',
};
const DEFAULT_TRUE_APPEARANCE = {
    icon: 'WarningIcon',
    color: '#EC5D74',
};
const DEFAULT_FALSE_LED_COLOR = '#57B573';
const DEFAULT_TRUE_LED_COLOR = '#EC5D74';

const getBooleanStatus = (value: unknown) => {
    return value === true || value === 'true' || value === 1 || value === '1';
};

const View = (props: ViewProps) => {
    const { config, configJson, widgetId, dashboardId } = props;
    const {
        entity,
        title,
        falseStatusLabel,
        trueStatusLabel,
        falseLabel,
        trueLabel,
        showLed,
        falseLedColor,
        trueLedColor,
    } = config || {};
    const { isPreview, name } = configJson || {};

    const { getIntlText } = useI18n();
    const { getCSSVariableValue } = useTheme();
    const { containerRef, showIconWidth } = useContainerRect();

    const [statusValue, setStatusValue] = useState(false);

    /**
     * Request physical state function
     */
    const { run: requestEntityStatus } = useRequest(
        async () => {
            if (!entity?.value) return;

            const [error, res] = await awaitWrap(entityAPI.getEntityStatus({ id: entity.value }));

            if (error || !isRequestSuccess(res)) {
                setStatusValue(false);
                return;
            }

            const entityStatus = getResponseData(res);
            setStatusValue(getBooleanStatus(entityStatus?.value));
        },
        {
            manual: true,
            refreshDeps: [entity?.value],
            debounceWait: 300,
        },
    );

    /**
     * Get the state of the selected entity
     */
    useEffect(() => {
        if (entity) {
            requestEntityStatus();
        } else {
            setStatusValue(false);
        }
    }, [entity, requestEntityStatus]);

    const displayTitle = useMemo(() => {
        return title || getIntlText(name || 'dashboard.plugin_name_status_card');
    }, [getIntlText, name, title]);

    const displayLabel = useMemo(() => {
        return (
            (statusValue ? trueStatusLabel || trueLabel : falseStatusLabel || falseLabel) ||
            getIntlText(statusValue ? 'common.label.true' : 'common.label.false')
        );
    }, [falseLabel, falseStatusLabel, getIntlText, statusValue, trueLabel, trueStatusLabel]);

    const appearance = useMemo(() => {
        return statusValue
            ? {
                  icon: get(config, 'trueAppearanceIcon.icon', DEFAULT_TRUE_APPEARANCE.icon),
                  color: get(config, 'trueAppearanceIcon.color', DEFAULT_TRUE_APPEARANCE.color),
              }
            : {
                  icon: get(config, 'falseAppearanceIcon.icon', DEFAULT_FALSE_APPEARANCE.icon),
                  color: get(config, 'falseAppearanceIcon.color', DEFAULT_FALSE_APPEARANCE.color),
              };
    }, [statusValue, config]);

    const ledColor = statusValue
        ? trueLedColor || DEFAULT_TRUE_LED_COLOR
        : falseLedColor || DEFAULT_FALSE_LED_COLOR;
    const appearanceColor = appearance.color || getCSSVariableValue('--gray-5');

    const IconComponent = useMemo(() => {
        const Icon = Reflect.get(Icons, appearance.icon || '');
        if (!Icon) return null;

        return <Icon sx={{ color: appearanceColor }} />;
    }, [appearance.icon, appearanceColor]);

    // ---------- Entity status management ----------
    const { addEntityListener } = useActivityEntity();

    useEffect(() => {
        const entityId = entity?.value;
        if (!widgetId || !dashboardId || !entityId) return;

        const removeEventListener = addEntityListener(entityId, {
            widgetId,
            dashboardId,
            callback: requestEntityStatus,
        });

        return () => {
            removeEventListener();
        };
    }, [entity?.value, widgetId, dashboardId, addEntityListener, requestEntityStatus]);

    return (
        <div
            ref={containerRef}
            className={cls('status-card-view', {
                'status-card-view-preview': isPreview,
            })}
        >
            <div className="status-card-view-card">
                {showIconWidth && (
                    <div
                        className="status-card-view-card__icon"
                        style={{
                            backgroundColor: `color-mix(in srgb, ${appearanceColor} 14%, transparent)`,
                        }}
                    >
                        {IconComponent}
                    </div>
                )}
                <div className="status-card-view-card__content">
                    <Tooltip
                        className="status-card-view-card__title"
                        autoEllipsis
                        title={displayTitle}
                    />
                    <Tooltip
                        className="status-card-view-card__value"
                        autoEllipsis
                        title={displayLabel}
                    />
                </div>
                {showLed !== false && (
                    <div
                        className="status-card-view-card__led"
                        style={{
                            backgroundColor: ledColor,
                            boxShadow: `0 0 0 4px color-mix(in srgb, ${ledColor} 12%, transparent)`,
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default View;
