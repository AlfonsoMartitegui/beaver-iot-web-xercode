import React, { useContext, useEffect, useLayoutEffect } from 'react';
import { Button, IconButton, FormHelperText } from '@mui/material';
import { isEqual } from 'lodash-es';
import { useControllableValue, useDynamicList } from 'ahooks';

import { useI18n } from '@milesight/shared/src/hooks';
import {
    AddIcon,
    DeleteOutlineIcon,
    KeyboardArrowDownIcon,
} from '@milesight/shared/src/components';
import { generateUUID } from '@milesight/shared/src/utils/tools';
import { EntitySelect, type EntitySelectOption } from '@/components';
import { DrawingBoardContext } from '@/components/drawing-board/context';
import { filterEntityMap, filterEntityOption } from '@/components/drawing-board/plugin/utils';
import AppearanceIcon, { type AppearanceIconValue } from '../appearance-icon';
import Input from '../input';
import MultiAppearanceIcon from '../multi-appearance-icon';

import styles from './style.module.less';

export interface MultiDataCardExtraItem {
    id: ApiKey;
    entity: EntitySelectOption | null;
    title?: string;
    icons?: Record<string, AppearanceIconValue>;
    appearanceIcon?: AppearanceIconValue;
    falseStatusLabel?: string;
    trueStatusLabel?: string;
    falseAppearanceIcon?: AppearanceIconValue;
    trueAppearanceIcon?: AppearanceIconValue;
}

export interface MultiDataCardExtraItemsProps {
    required?: boolean;
    error?: boolean;
    helperText?: React.ReactNode;
    value?: MultiDataCardExtraItem[];
    defaultValue?: MultiDataCardExtraItem[];
    onChange?: (value: MultiDataCardExtraItem[]) => void;
    customFilterEntity?: keyof typeof filterEntityMap;
    entityType?: EntityType[];
    entityValueType?: EntityValueDataType[];
    entityAccessMod?: EntityAccessMode[];
    excludeChildren?: boolean;
    maxCount?: number;
}

const isBooleanEntity = (entity?: EntitySelectOption | null) => {
    return entity?.rawData?.entityValueType === 'BOOLEAN' || entity?.valueType === 'BOOLEAN';
};

const hasEnum = (entity?: EntitySelectOption | null) => {
    return Boolean(entity?.rawData?.entityValueAttribute?.enum);
};

const createItem = (): MultiDataCardExtraItem => ({
    id: generateUUID(),
    entity: null,
    title: '',
});

const MultiDataCardExtraItems: React.FC<MultiDataCardExtraItemsProps> = ({
    required,
    error,
    helperText,
    customFilterEntity,
    entityType,
    entityValueType,
    entityAccessMod,
    excludeChildren,
    maxCount = 10,
    ...props
}) => {
    const { getIntlText } = useI18n();
    const [data, setData] = useControllableValue<MultiDataCardExtraItem[]>(props);
    const { list, remove, getKey, insert, replace, resetList } =
        useDynamicList<MultiDataCardExtraItem>(data || []);
    const context = useContext(DrawingBoardContext);

    useLayoutEffect(() => {
        if (
            isEqual(
                data || [],
                list.filter(item => Boolean(item.id)),
            )
        ) {
            return;
        }

        resetList(data || []);
        // Keep the same controlled-list sync pattern used by the chart list controls.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, resetList]);

    useEffect(() => {
        setData?.(list.filter(item => Boolean(item.id)));
    }, [list, setData]);

    return (
        <div className={styles['multi-data-card-extra-items']}>
            <div className={styles.label}>{getIntlText('dashboard.label.extra_values')}</div>
            <div className={styles['list-content']}>
                {list.map((item, index) => {
                    const isBoolean = isBooleanEntity(item.entity);
                    const isEnum = hasEnum(item.entity);

                    return (
                        <div className={styles.item} key={getKey(index)}>
                            <div className={styles['item-header']}>
                                <div className={styles['item-label']}>
                                    {getIntlText('common.label.entity')}
                                    {required && <span className={styles.required}>*</span>}
                                </div>
                                <IconButton size="small" onClick={() => remove(index)}>
                                    <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            </div>
                            <EntitySelect
                                required={required}
                                fieldName="entityId"
                                popupIcon={<KeyboardArrowDownIcon />}
                                filterOption={filterEntityOption(customFilterEntity, context)}
                                size="small"
                                sx={{
                                    width: '100%',
                                    marginBottom: 2,
                                }}
                                value={String(item.entity?.value || '')}
                                onChange={option => {
                                    replace(index, {
                                        ...item,
                                        id: option?.rawData?.entityId || item.id,
                                        entity: option,
                                        icons: undefined,
                                    });
                                }}
                                dropdownMatchSelectWidth={365}
                                entityType={entityType}
                                entityValueType={entityValueType}
                                entityAccessMod={entityAccessMod}
                                excludeChildren={excludeChildren}
                            />
                            <Input
                                label={getIntlText('common.label.title')}
                                value={item.title || ''}
                                onChange={title => {
                                    replace(index, {
                                        ...item,
                                        title: title as unknown as string,
                                    });
                                }}
                                slotProps={{
                                    input: {
                                        size: 'small',
                                    },
                                    htmlInput: {
                                        maxLength: 35,
                                    },
                                }}
                                sx={{
                                    marginBottom: 2,
                                }}
                            />
                            {isBoolean ? (
                                <>
                                    <div className={styles['item-fields']}>
                                        <Input
                                            label={getIntlText(
                                                'dashboard.label.false_status_label',
                                            )}
                                            value={item.falseStatusLabel || ''}
                                            onChange={falseStatusLabel => {
                                                replace(index, {
                                                    ...item,
                                                    falseStatusLabel:
                                                        falseStatusLabel as unknown as string,
                                                });
                                            }}
                                            slotProps={{
                                                input: { size: 'small' },
                                                htmlInput: { maxLength: 35 },
                                            }}
                                            sx={{
                                                marginBottom: 2,
                                            }}
                                        />
                                        <Input
                                            label={getIntlText('dashboard.label.true_status_label')}
                                            value={item.trueStatusLabel || ''}
                                            onChange={trueStatusLabel => {
                                                replace(index, {
                                                    ...item,
                                                    trueStatusLabel:
                                                        trueStatusLabel as unknown as string,
                                                });
                                            }}
                                            slotProps={{
                                                input: { size: 'small' },
                                                htmlInput: { maxLength: 35 },
                                            }}
                                            sx={{
                                                marginBottom: 2,
                                            }}
                                        />
                                    </div>
                                    <div className={styles['item-appearance']}>
                                        <AppearanceIcon
                                            label={getIntlText(
                                                'dashboard.label.false_status_appearance',
                                            )}
                                            value={item.falseAppearanceIcon}
                                            onChange={falseAppearanceIcon => {
                                                replace(index, {
                                                    ...item,
                                                    falseAppearanceIcon,
                                                });
                                            }}
                                        />
                                        <AppearanceIcon
                                            label={getIntlText(
                                                'dashboard.label.true_status_appearance',
                                            )}
                                            value={item.trueAppearanceIcon}
                                            onChange={trueAppearanceIcon => {
                                                replace(index, {
                                                    ...item,
                                                    trueAppearanceIcon,
                                                });
                                            }}
                                        />
                                    </div>
                                </>
                            ) : isEnum ? (
                                <div className={styles['item-appearance']}>
                                    <MultiAppearanceIcon
                                        value={item.icons}
                                        formData={{ entity: item.entity }}
                                        onChange={icons => {
                                            replace(index, {
                                                ...item,
                                                icons,
                                            });
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className={styles['item-appearance']}>
                                    <AppearanceIcon
                                        label={getIntlText('common.label.appearance')}
                                        value={item.appearanceIcon}
                                        onChange={appearanceIcon => {
                                            replace(index, {
                                                ...item,
                                                appearanceIcon,
                                            });
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
                <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AddIcon />}
                    disabled={list.length >= maxCount}
                    size="small"
                    onClick={() => {
                        if (list.length >= maxCount) return;
                        insert(list.length, createItem());
                    }}
                >
                    {getIntlText('common.label.add')}
                </Button>
            </div>
            <FormHelperText error={Boolean(error)}>{helperText}</FormHelperText>
        </div>
    );
};

export default React.memo(MultiDataCardExtraItems);
