import { useMemo, useState, useCallback, useEffect, type CSSProperties } from 'react';
import { useRequest, useDebounceFn } from 'ahooks';
import { get } from 'lodash-es';
import cls from 'classnames';

import { useTheme } from '@milesight/shared/src/hooks';
import * as Icons from '@milesight/shared/src/components/icons';
import { entityAPI, awaitWrap, isRequestSuccess, getResponseData } from '@/services/http';
import { useActivityEntity, useContainerRect } from '../../../hooks';
import { Tooltip } from '../../../view-components';
import type { BoardPluginProps } from '../../../types';
import type { ToggleButtonControlPanelConfig } from '../control-panel';

import styles from './style.module.less';

export interface ViewProps {
    widgetId: ApiKey;
    dashboardId: ApiKey;
    config: ToggleButtonControlPanelConfig;
    configJson: BoardPluginProps;
}

type DefaultAppearance = {
    icon?: string;
    color: string;
};

const DEFAULT_FALSE_APPEARANCE: DefaultAppearance = {
    icon: 'IotSwitchOffIcon',
    color: '#9B9B9B',
};
const DEFAULT_TRUE_APPEARANCE: DefaultAppearance = {
    icon: 'IotSwitchOnIcon',
    color: '#334E9D',
};

const getBooleanStatus = (value: unknown) => {
    return value === true || value === 'true' || value === 1 || value === '1';
};

const View = (props: ViewProps) => {
    const { config, configJson, widgetId, dashboardId } = props;
    const { entity, title, falseLabel, trueLabel } = config || {};
    const { isPreview } = configJson || {};

    const { matchTablet } = useTheme();
    const { containerRef, showIconWidth } = useContainerRect();

    const [isToggleOn, setIsToggleOn] = useState(false);

    /**
     * Request physical state function
     */
    const { run: requestEntityStatus } = useRequest(
        async () => {
            if (!entity?.value) return;

            const [error, res] = await awaitWrap(entityAPI.getEntityStatus({ id: entity.value }));

            if (error || !isRequestSuccess(res)) {
                setIsToggleOn(false);
                return;
            }

            const entityStatus = getResponseData(res);
            setIsToggleOn(getBooleanStatus(entityStatus?.value));
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
            setIsToggleOn(false);
        }
    }, [entity, requestEntityStatus]);

    /**
     * When toggling Button state,
     * Update the status data of the selected entity
     */
    const handleEntityStatus = useCallback(
        async (toggleVal: boolean) => {
            const entityKey = entity?.rawData?.entityKey;

            if (!entityKey || Boolean(isPreview)) return;

            entityAPI.updateProperty({
                exchange: { [entityKey]: toggleVal },
            });
        },
        [entity, isPreview],
    );

    const { run: handleToggleChange } = useDebounceFn(
        () => {
            const nextValue = !isToggleOn;

            setIsToggleOn(nextValue);
            handleEntityStatus(nextValue);
        },
        { wait: 300 },
    );

    const appearance = useMemo(() => {
        return isToggleOn
            ? {
                  icon:
                      get(config, 'trueAppearanceIcon.icon') ??
                      get(config, 'onAppearanceIcon.icon', DEFAULT_TRUE_APPEARANCE.icon),
                  color:
                      get(config, 'trueAppearanceIcon.color') ||
                      get(config, 'onAppearanceIcon.color', DEFAULT_TRUE_APPEARANCE.color),
              }
            : {
                  icon:
                      get(config, 'falseAppearanceIcon.icon') ??
                      get(config, 'offAppearanceIcon.icon', DEFAULT_FALSE_APPEARANCE.icon),
                  color:
                      get(config, 'falseAppearanceIcon.color') ||
                      get(config, 'offAppearanceIcon.color', DEFAULT_FALSE_APPEARANCE.color),
              };
    }, [isToggleOn, config]);

    const displayLabel = useMemo(() => {
        return (isToggleOn ? trueLabel : falseLabel) || title;
    }, [falseLabel, isToggleOn, title, trueLabel]);

    /**
     * Icon component
     */
    const IconComponent = useMemo(() => {
        const Icon = Reflect.get(Icons, appearance.icon || '');
        if (!Icon) return null;

        return <Icon sx={{ color: 'var(--white)', fontSize: 24 }} />;
    }, [appearance]);

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
            className={cls(styles['toggle-button-wrapper'], {
                [styles.preview]: isPreview,
            })}
            style={{ '--toggle-color': appearance.color } as CSSProperties}
        >
            <button
                className={cls(styles.button, {
                    [styles.tablet]: matchTablet,
                })}
                type="button"
                aria-pressed={isToggleOn}
                onClick={handleToggleChange}
            >
                {showIconWidth && IconComponent && (
                    <span className={styles.icon}>{IconComponent}</span>
                )}
                <Tooltip className={styles.text} autoEllipsis title={displayLabel} />
            </button>
        </div>
    );
};

export default View;
