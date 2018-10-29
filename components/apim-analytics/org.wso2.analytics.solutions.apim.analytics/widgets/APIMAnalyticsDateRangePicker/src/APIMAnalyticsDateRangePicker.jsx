/*
 *  Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 */

/* eslint-disable comma-dangle */
import React from 'react';
import Widget from '@wso2-dashboards/widget';
import FlatButton from 'material-ui/FlatButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { NotificationSync, NotificationSyncDisabled } from 'material-ui/svg-icons';
import Moment from 'moment';
import { Scrollbars } from 'react-custom-scrollbars';
import JssProvider from 'react-jss/lib/JssProvider';
import GranularityModeSelector from './GranularityModeSelector';

// This is the workaround suggested in https://github.com/marmelab/react-admin/issues/1782
const escapeRegex = /([[\].#*$><+~=|^:(),"'`\s])/g;
let classCounter = 0;

export const generateClassName = (rule, styleSheet) => {
    classCounter += 1;

    if (process.env.NODE_ENV === 'production') {
        return `c${classCounter}`;
    }

    if (styleSheet && styleSheet.options.classNamePrefix) {
        let prefix = styleSheet.options.classNamePrefix;
        // Sanitize the string as will be used to prefix the generated class name.
        prefix = prefix.replace(escapeRegex, '-');

        if (prefix.match(/^Mui/)) {
            return `${prefix}-${rule.key}`;
        }

        return `${prefix}-${rule.key}-${classCounter}`;
    }

    return `${rule.key}-${classCounter}`;
};

export default class APIMAnalyticsDateRangePicker extends Widget {
    constructor(props) {
        super(props);
        this.state = {
            id: props.widgetID,
            width: props.glContainer.width,
            height: props.glContainer.height,
            granularityMode: null,
            granularityValue: '',
            options: this.props.configs.options,
            enableSync: false,
            btnType: <NotificationSyncDisabled color='#BDBDBD' />,
        };

        this.publishTimeRange = this.publishTimeRange.bind(this);
        this.handleGranularityChange = this.handleGranularityChange.bind(this);
        this.handleGranularityChangeForCustom = this.handleGranularityChangeForCustom.bind(this);
        this.getTimeIntervalDescriptor = this.getTimeIntervalDescriptor.bind(this);
        this.getStartTimeAndEndTimeForTimeIntervalDescriptor = this
            .getStartTimeAndEndTimeForTimeIntervalDescriptor.bind(this);
        this.getStartTime = this.getStartTime.bind(this);
        this.autoSyncClick = this.autoSyncClick.bind(this);
        this.setRefreshInterval = this.setRefreshInterval.bind(this);
        this.clearRefreshInterval = this.clearRefreshInterval.bind(this);

        this.props.glContainer.on('resize', () => this.setState({
            width: this.props.glContainer.width,
            height: this.props.glContainer.height,
        }));
    }

    publishTimeRange(message) {
        super.publish(message);
    }

    getDateTimeRangeInfo() {
        return super.getGlobalState('apim-dtrp');
    }

    handleGranularityChange(mode) {
        this.clearRefreshInterval();
        const startTime = this.getStartTime(mode);
        const endTime = new Date();
        this.publishTimeRange({
            from: startTime.getTime(),
            to: endTime.getTime(),
        });
        this.setRefreshInterval();
        this.setState({
            granularityMode: mode,
            startTime,
            endTime,
        });
    }

    handleGranularityChangeForCustom(startTime, endTime) {
        this.clearRefreshInterval();
        this.publishTimeRange({
            from: startTime.getTime(),
            to: endTime.getTime(),
        });
        this.setState({
            granularityMode: 'custom',
            startTime,
            endTime,
        });
    }

    getStartTime(mode) {
        let startTime = null;

        switch (mode) {
            case '1 Min':
                startTime = Moment().subtract(1, 'minutes').toDate();
                break;
            case '15 Min':
                startTime = Moment().subtract(15, 'minutes').toDate();
                break;
            case '1 Hour':
                startTime = Moment().subtract(1, 'hours').toDate();
                break;
            case '1 Day':
                startTime = Moment().subtract(1, 'days').toDate();
                break;
            case '1 Week':
                startTime = Moment().subtract(1, 'weeks').toDate();
                break;
            case '2 Weeks':
                startTime = Moment().subtract(2, 'weeks').toDate();
                break;
            case '1 Month':
                startTime = Moment().subtract(1, 'months').toDate();
                break;
            case '3 Months':
                startTime = Moment().subtract(3, 'months').toDate();
                break;
            case '6 Months':
                startTime = Moment().subtract(6, 'months').toDate();
                break;
            case '1 Year':
                startTime = Moment().subtract(1, 'years').toDate();
                break;
            default:
            // do nothing
        }
        return startTime;
    }

    loadDefaultTimeRange() {
        const dateTimeRangeInfo = this.getDateTimeRangeInfo();
        const defaultTimeRange = this.state.options.defaultValue || '1 Week';
        if (dateTimeRangeInfo.tr) {
            if (dateTimeRangeInfo.tr.toLowerCase() === 'custom') {
                if (dateTimeRangeInfo.sd
                    && dateTimeRangeInfo.ed) {
                    this.loadUserSpecifiedCustomTimeRange(dateTimeRangeInfo.sd, dateTimeRangeInfo.ed);
                } else {
                    this.handleGranularityChange(defaultTimeRange);
                }
            } else {
                if (dateTimeRangeInfo.sync) {
                    this.setState({
                        enableSync: true,
                        btnType: <NotificationSync color='#f17b31' />,
                    });
                }
                this.loadUserSpecifiedTimeRange(dateTimeRangeInfo.tr);
            }
        } else {
            this.handleGranularityChange(defaultTimeRange);
        }
    }

    loadUserSpecifiedCustomTimeRange(start, end) {
        const startAndEndTime = this.formatTimeRangeDetails(start, end);
        if (startAndEndTime != null) {
            this.clearRefreshInterval();
            this.publishTimeRange({
                from: startAndEndTime.startTime,
                to: startAndEndTime.endTime,
            });
            this.setState({
                granularityMode: 'custom',
                startTime: Moment(startAndEndTime.startTime).toDate(),
                endTime: Moment(startAndEndTime.endTime).toDate(),
            });
        } else {
            this.handleGranularityChange(this.state.options.defaultValue || '1 Week');
        }
    }

    loadUserSpecifiedTimeRange(range) {
        const timeRange = this.getTimeRangeName(range);
        if (timeRange.length > 0) {
            this.clearRefreshInterval();
            this.handleGranularityChange(timeRange);
        } else {
            this.handleGranularityChange(this.state.options.defaultValue || '1 Week');
        }
    }

    getTimeRangeName(timeRange) {
        let name = '';
        if (timeRange) {
            const rangeParts = (timeRange.toLowerCase().match(/[0-9]+|[a-z]+/g) || []);
            if (rangeParts.length === 2) {
                switch (rangeParts[0] + ' ' + rangeParts[1]) {
                    case '1 min':
                        name = '1 Min';
                        break;
                    case '15 min':
                        name = '15 Min';
                        break;
                    case '1 hour':
                        name = '1 Hour';
                        break;
                    case '1 day':
                        name = '1 Day';
                        break;
                    case '1 week':
                        name = '1 Week';
                        break;
                    case '2 weeks':
                        name = '2 Weeks';
                        break;
                    case '1 month':
                        name = '1 Month';
                        break;
                    case '3 months':
                        name = '3 Months';
                        break;
                    case '6 months':
                        name = '6 Months';
                        break;
                    case '1 year':
                        name = '1 Year';
                        break;
                    default:
                    // do nothing
                }
            }
        }
        return name;
    }

    formatTimeRangeDetails(startTime, endTime) {
        let start = null;
        let end = null;
        let result = null;

        const startTimeFormat = this.getDateTimeFormat(startTime);
        const endTimeFormat = this.getDateTimeFormat(endTime);


        if (startTimeFormat != null && endTimeFormat != null) {
            start = Moment(startTime, startTimeFormat).valueOf();
            end = Moment(endTime, endTimeFormat).valueOf();
            if (start !== 'Invalid date' && end !== 'Invalid date') {
                result = { startTime: start, endTime: end };
            }
        }
        return result;
    }

    getDateTimeFormat(dateTime) {
        const dateTimeParts = dateTime.split(' ');
        let timeFormat = null;
        if (dateTimeParts.length > 1) {
            timeFormat = 'hh:mm:ss A';
        }
        const dateParts = dateTimeParts[0].split('-');
        let dateFormat = null;

        if (dateParts.length === 3) {
            dateFormat = 'YYYY-MMM-DD';
        } else if (dateParts.length === 2) {
            dateFormat = 'YYYY-MMM';
        } else if (dateParts.length === 1) {
            dateFormat = 'YYYY';
        }

        if (dateFormat != null) {
            if (timeFormat != null) {
                return dateFormat + ' ' + timeFormat;
            } else {
                return dateFormat;
            }
        } else {
            return null;
        }
    }

    componentDidMount() {
        this.loadDefaultTimeRange();
    }

    componentWillUnmount() {
        clearInterval(this.state.refreshIntervalId);
    }

    render() {
        const { granularityMode, width, height } = this.state;

        return (
            <JssProvider
                generateClassName={generateClassName}
            >
                <MuiThemeProvider
                    muiTheme={this.props.muiTheme}
                >
                    <Scrollbars
                        style={{ width, height }}
                    >
                        <div
                            style={{ paddingLeft: 15 }}
                        >
                            <GranularityModeSelector
                                onChange={this.handleGranularityChange}
                                onChangeCustom={this.handleGranularityChangeForCustom}
                                options={this.state.options}
                                getTimeRangeName={this.getTimeRangeName}
                                getDateTimeRangeInfo={this.getDateTimeRangeInfo}
                                theme={this.props.muiTheme}
                                width={this.state.width}
                                height={this.state.height}
                            />
                            {this.getTimeIntervalDescriptor(granularityMode)}
                        </div>
                    </Scrollbars>
                </MuiThemeProvider>
            </JssProvider>
        );
    }

    getTimeIntervalDescriptor(granularityMode) {
        let startAndEnd = {
            startTime: null,
            endTime: null
        };
        if (granularityMode === 'custom') {
            if (this.state.startTime && this.state.endTime) {
                startAndEnd.startTime = Moment
                    .unix(this.state.startTime.getTime() / 1000).format('YYYY-MMM-DD hh:mm:ss A');
                startAndEnd.endTime = Moment.unix(this.state.endTime.getTime() / 1000).format('YYYY-MMM-DD hh:mm:ss A');
            }
        } else {
            startAndEnd = this.getStartTimeAndEndTimeForTimeIntervalDescriptor(granularityMode);
        }

        const { startTime, endTime } = startAndEnd;
        if (granularityMode && startTime && endTime) {
            this.setQueryParamToURL(
                granularityMode.replace(' ', '').toLowerCase(),
                startTime.toLowerCase(),
                endTime.toLowerCase(),
                this.state.granularityValue,
                this.state.enableSync
            );
            return (
                <div
                    style={{
                        display: 'flex',
                        alignContent: 'center',
                        width: '100%',
                    }}
                >
                    <div
                        style={{
                            lineHeight: 3,
                            verticalAlign: 'middle',
                        }}
                    >
                        {`${startTime}`}
                        <span style={{ color: '#828282' }}> to </span>
                        {`${endTime}`}
                    </div>
                    <FlatButton
                        label='Auto-Sync'
                        icon={this.state.btnType}
                        onClick={this.autoSyncClick}
                        style={{
                            marginLeft: 20,
                            marginTop: 8,
                        }}
                    />
                </div>
            );
        } else {
            return null;
        }
    }

    getStartTimeAndEndTimeForTimeIntervalDescriptor(granularityMode) {
        let startTime = null;
        let endTime = null;

        switch (granularityMode) {
            case '1 Min':
                startTime = Moment().subtract(1, 'minutes').format('YYYY-MMM-DD hh:mm A');
                endTime = Moment().format('YYYY-MMM-DD hh:mm A');
                break;
            case '15 Min':
                startTime = Moment().subtract(15, 'minutes').format('YYYY-MMM-DD hh:mm A');
                endTime = Moment().format('YYYY-MMM-DD hh:mm A');
                break;
            case '1 Hour':
                startTime = Moment().subtract(1, 'hours').format('YYYY-MMM-DD hh:mm A');
                endTime = Moment().format('YYYY-MMM-DD hh:mm A');
                break;
            case '1 Day':
                startTime = Moment().subtract(1, 'days').format('YYYY-MMM-DD');
                endTime = Moment().format('YYYY-MMM-DD');
                break;
            case '1 Week':
                startTime = Moment().subtract(1, 'weeks').format('YYYY-MMM-DD');
                endTime = Moment().format('YYYY-MMM-DD');
                break;
            case '2 Weeks':
                startTime = Moment().subtract(2, 'weeks').format('YYYY-MMM-DD');
                endTime = Moment().format('YYYY-MMM-DD');
                break;
            case '1 Month':
                startTime = Moment().subtract(1, 'months').format('YYYY-MMM');
                endTime = Moment().format('YYYY-MMM');
                break;
            case '3 Months':
                startTime = Moment().subtract(3, 'months').format('YYYY-MMM');
                endTime = Moment().format('YYYY-MMM');
                break;
            case '6 Months':
                startTime = Moment().subtract(6, 'months').format('YYYY-MMM');
                endTime = Moment().format('YYYY-MMM');
                break;
            case '1 Year':
                startTime = Moment().subtract(1, 'years').format('YYYY');
                endTime = Moment().format('YYYY');
                break;
            default:
            // do nothing
        }
        return { startTime, endTime };
    }

    autoSyncClick() {
        if (!this.state.enableSync) {
            this.setState({
                enableSync: true,
                btnType: <NotificationSync color='#f17b31' />,
            }, this.setRefreshInterval);
        } else {
            this.setState({
                enableSync: false,
                btnType: <NotificationSyncDisabled color='#BDBDBD' />,
            });
            this.clearRefreshInterval();
        }
    }

    setRefreshInterval() {
        if (this.state.enableSync) {
            const refreshInterval = this.state.options.autoSyncInterval * 1000 || 60000;
            const refresh = () => {
                this.publishTimeRange({
                    from: this.getStartTime(this.state.granularityMode).getTime(),
                    to: new Date().getTime(),
                });
            };
            const intervalID = setInterval(refresh, refreshInterval);
            this.setState({
                refreshIntervalId: intervalID,
                endTime: new Date(),
            });
        }
    }

    clearRefreshInterval() {
        clearInterval(this.state.refreshIntervalId);
        this.setState({
            refreshIntervalId: null,
        });
    }

    setQueryParamToURL(timeRange, startTime, endTime, granularity, autoSync) {
        super.setGlobalState('apim-dtrp', {
            tr: timeRange,
            sd: startTime,
            ed: endTime,
            sync: autoSync,
        });
    }
}

global.dashboard.registerWidget('APIMAnalyticsDateRangePicker', APIMAnalyticsDateRangePicker);
