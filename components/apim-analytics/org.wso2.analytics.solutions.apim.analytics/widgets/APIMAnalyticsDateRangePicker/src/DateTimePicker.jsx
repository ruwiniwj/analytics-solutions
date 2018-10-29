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

/* eslint-disable react/prop-types,comma-dangle,react/destructuring-assignment */
import React from 'react';
import { MenuItem, SelectField } from 'material-ui';
import moment from 'moment';

export default class DateTimePicker extends React.Component {
    constructor(props) {
        super(props);
        const { initTime } = this.props;
        this.state = {
            year: initTime.year(),
            month: initTime.month(),
            days: initTime.date(),
            time: initTime.format('HH:mm:ss.000'),
        };

        this.generateDays = this.generateDays.bind(this);
        this.generateMonths = this.generateMonths.bind(this);
        this.generateYears = this.generateYears.bind(this);
    }

    isLeapYear(year) {
        return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
    }

    generateDays(year, month, inputName, startTime) {
        const dayComponents = [];
        let days = 0;

        if (month === 1) {
            if (this.isLeapYear(year)) days = 29;
            else days = 28;
        } else if ((month < 7 && ((month + 1) % 2 === 1)) || (month > 6 && ((month + 1) % 2 === 0))) {
            days = 31;
        } else {
            days = 30;
        }
        if (inputName === 'startTime') {
            for (let i = 1; i <= days; i++) {
                dayComponents.push(
                    <MenuItem
                        key={`$days-${i}`}
                        value={i}
                        primaryText={i}
                    />
                );
            }
        } else if (inputName === 'endTime') {
            if (moment(startTime).month() === this.state.month) {
                const startDate = moment(startTime).date();
                for (let i = startDate; i <= days; i++) {
                    dayComponents.push(
                        <MenuItem
                            key={`$days-${i}`}
                            value={i}
                            primaryText={i}
                        />
                    );
                }
                if (this.state.days < startDate) {
                    this.setState({ days: startDate + 1 });
                    this.handleOnChange('days', startDate + 1);
                }
            } else {
                for (let i = 1; i <= days; i++) {
                    dayComponents.push(
                        <MenuItem
                            key={`$days-${i}`}
                            value={i}
                            primaryText={i}
                        />
                    );
                }
            }
        }

        return dayComponents;
    }

    generateMonths(inputName, startTime) {
        const monthComponents = [];
        const monthArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
            'October', 'November', 'December'];

        if (inputName === 'startTime') {
            for (let i = 0; i < monthArray.length; i++) {
                monthComponents.push(
                    <MenuItem
                        key={`month-${i}`}
                        value={i}
                        primaryText={monthArray[i]}
                    />
                );
            }
        } else if (inputName === 'endTime') {
            const start = moment(startTime);
            const { year } = this.state;
            const yearDiff = year - start.year();
            if (yearDiff <= 0) {
                const startMonth = start.month();
                for (let i = startMonth; i < monthArray.length; i++) {
                    monthComponents.push(
                        <MenuItem
                            key={`month-${i}`}
                            value={i}
                            primaryText={monthArray[i]}
                        />
                    );
                }
                const { month } = this.state;
                if (month < startMonth) {
                    this.setState({ month: startMonth });
                    this.handleOnChange('month', startMonth);
                }
            } else if (yearDiff > 0) {
                for (let i = 0; i < monthArray.length; i++) {
                    monthComponents.push(
                        <MenuItem
                            key={`month-${i}`}
                            value={i}
                            primaryText={monthArray[i]}
                        />
                    );
                }
            }
        }

        return monthComponents;
    }

    generateYears(inputName, startTime) {
        const yearArray = [];

        if (inputName === 'startTime') {
            for (let index = 1970; index <= 2099; index++) {
                yearArray.push(
                    <MenuItem
                        key={`year-${index}`}
                        value={index}
                        primaryText={index}
                    />
                );
            }
        } else if (inputName === 'endTime') {
            const startYear = moment(startTime).year();
            for (let index = startYear; index <= 2099; index++) {
                yearArray.push(
                    <MenuItem
                        key={`year-${index}`}
                        value={index}
                        primaryText={index}
                    />
                );
            }
            const { year } = this.state;
            if (year < startYear) {
                this.setState({ year: startYear });
                this.handleOnChange('year', startYear);
            }
        }

        return yearArray;
    }

    handleOnChange(property, value) {
        const { onChange } = this.props;
        const { state } = this;

        state[property] = value;
        const date = moment(`${state.year}:${(state.month + 1)}:${state.days} ${state.time}`,
            'YYYY-MM-DD HH:mm:ss.000').toDate();
        this.setState(state);

        return onChange && onChange(date);
    }

    render() {
        const { year, month, days } = this.state;
        const { time } = this.state;
        const { theme, inputName, startTime } = this.props;

        return (
            <div>
                <div
                    style={{ display: 'inline-block' }}
                >
                    <SelectField
                        value={year}
                        onChange={(event, index, value) => {
                            this.handleOnChange('year', value);
                        }}
                    >
                        {this.generateYears(inputName, startTime)}
                    </SelectField>
                    <SelectField
                        value={month}
                        onChange={(event, index, value) => {
                            this.handleOnChange('month', value);
                        }}
                    >
                        {this.generateMonths(inputName, startTime)}
                    </SelectField>
                    <SelectField
                        value={days}
                        onChange={(event, index, value) => {
                            this.handleOnChange('days', value);
                        }}
                    >
                        {this.generateDays(year, month, inputName, startTime)}
                    </SelectField>
                </div>
                <div>
                    <br />
                    Time
                    <br />
                    <div>
                        <div>
                            <input
                                type='time'
                                value={time}
                                onChange={(evt) => {
                                    this.handleOnChange('time', evt.target.value);
                                }}
                                style={{
                                    color: theme.palette.textColor,
                                    backgroundColor: theme.palette.canvasColor,
                                    borderBottom: '1px solid',
                                    borderTop: 'none',
                                    borderLeft: 'none',
                                    borderRight: 'none',
                                    width: 150,
                                    height: 30,
                                    fontSize: 15
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
