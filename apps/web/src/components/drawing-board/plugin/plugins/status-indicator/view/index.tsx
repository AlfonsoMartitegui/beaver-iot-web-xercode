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

import styles from './style.module.less';

export interface ViewProps {
    widgetId: ApiKey;
    dashboardId: ApiKey;
    config: {
        entity?: EntityOptionType;
        title?: string;
        label?: string;
        falseLabel?: string;
        trueLabel?: string;
        falseAppearanceIcon?: {
            icon?: string;
            color?: string;
        };
        trueAppearanceIcon?: {
            icon?: string;
            color?: string;
        };
        /** @deprecated Use falseLabel instead. */
        normalLabel?: string;
        /** @deprecated Use trueLabel instead. */
        alarmLabel?: string;
        /** @deprecated Use falseAppearanceIcon instead. */
        normalAppearanceIcon?: {
            icon?: string;
            color?: string;
        };
        /** @deprecated Use trueAppearanceIcon instead. */
        alarmAppearanceIcon?: {
            icon?: string;
            color?: string;
        };
    };
    configJson: BoardPluginProps;
}

const getBooleanStatus = (value: unknown) => {
    return value === true || value === 'true' || value === 1 || value === '1';
};

const View = (props: ViewProps) => {
    const { config, configJson, widgetId, dashboardId } = props;
    const { entity, title, label, falseLabel, trueLabel, normalLabel, alarmLabel } = config || {};
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

    const displayLabel = useMemo(() => {
        const fallbackLabel =
            title || label || getIntlText(name || 'dashboard.plugin_name_status_indicator');

        return (statusValue ? trueLabel || alarmLabel : falseLabel || normalLabel) || fallbackLabel;
    }, [
        alarmLabel,
        falseLabel,
        getIntlText,
        label,
        name,
        normalLabel,
        statusValue,
        title,
        trueLabel,
    ]);

    const appearance = useMemo(() => {
        return statusValue
            ? {
                  icon:
                      get(config, 'trueAppearanceIcon.icon') ||
                      get(config, 'alarmAppearanceIcon.icon', 'WarningIcon'),
                  color:
                      get(config, 'trueAppearanceIcon.color') ||
                      get(config, 'alarmAppearanceIcon.color', '#EC5D74'),
              }
            : {
                  icon:
                      get(config, 'falseAppearanceIcon.icon') ||
                      get(config, 'normalAppearanceIcon.icon', 'CheckCircleIcon'),
                  color:
                      get(config, 'falseAppearanceIcon.color') ||
                      get(config, 'normalAppearanceIcon.color', '#57B573'),
              };
    }, [statusValue, config]);

    const IconComponent = useMemo(() => {
        const Icon = Reflect.get(Icons, appearance.icon || '');
        if (!Icon) return null;

        return <Icon sx={{ color: getCSSVariableValue('--white'), fontSize: 28 }} />;
    }, [appearance.icon, getCSSVariableValue]);

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
            className={cls(styles['status-indicator-wrapper'], {
                [styles.preview]: isPreview,
            })}
            style={{ backgroundColor: appearance.color }}
        >
            {showIconWidth && <div className={styles.icon}>{IconComponent}</div>}
            <div className={styles.label}>
                <Tooltip className={styles.text} autoEllipsis title={displayLabel} />
            </div>
        </div>
    );
};

export default View;
