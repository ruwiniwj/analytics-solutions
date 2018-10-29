/* eslint-disable react/prop-types,react/no-unused-state */
/*
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import { HardwareKeyboardArrowRight, HardwareKeyboardArrowLeft } from 'material-ui/svg-icons';
import FlatButton from 'material-ui/FlatButton';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import IconButton from 'material-ui/IconButton';
import CustomTimeRangeSelector from './CustomTimeRangeSelector';


const lowGranularityOptions = ['1 Min', '15 Min', '1 Hour', '1 Day', '1 Week', '2 Weeks'];
const highGranularityOptions = ['2 Weeks', '1 Month', '3 Months', '6 Months', '1 Year'];

export default class GranularityModeSelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            granularityMode: this.getSelectedGranularityLevel(),
            granularityModeValue: 'none',
            open: false,
        };

        this.generateTabs = this.generateTabs.bind(this);
        this.switchGranularity = this.switchGranularity.bind(this);
        this.onGranularityModeChange = this.onGranularityModeChange.bind(this);
        this.generateGranularityModeSwitchButton = this.generateGranularityModeSwitchButton.bind(this);
        this.generateLeftArrow = this.generateLeftArrow.bind(this);
        this.generateRightArrow = this.generateRightArrow.bind(this);
        this.getCustomSelectButton = this.getCustomSelectButton.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleRequestClose = this.handleRequestClose.bind(this);
        this.getSelectedGranularityLevel = this.getSelectedGranularityLevel.bind(this);
    }

    onGranularityModeChange(value) {
        const { onChange } = this.props;
        this.setState({ granularityModeValue: value });
        return onChange && onChange(value);
    }


    getCustomSelectButton() {
        const {
            getDateTimeRangeInfo, options, onChangeCustom, theme,
        } = this.props;
        const { open, anchorEl } = this.state;
        const selectedTimeRange = getDateTimeRangeInfo().tr || '';
        const customButton = selectedTimeRange === 'custom'
            ? (
                <FlatButton
                    onClick={this.handleClick}
                    label='Custom'
                    style={{ borderBottom: theme.name === 'dark' ? '1px solid red' : '1px solid gray' }}
                />
            )
            : (
                <FlatButton
                    onClick={this.handleClick}
                    label='Custom'
                    style={{ borderBottom: 'none' }}
                />
            );
        return (
            <div
                style={{ display: 'inline' }}
            >
                {customButton}
                <Popover
                    open={open}
                    anchorEl={anchorEl}
                    anchorOrigin={{
                        horizontal: 'left',
                        vertical: 'bottom',
                    }}
                    targetOrigin={{
                        horizontal: 'left',
                        vertical: 'top',
                    }}
                    onRequestClose={this.handleRequestClose}
                    style={{ maxWidth: 560 }}
                >
                    <Menu style={{ maxWidth: 560 }}>
                        <div
                            style={{
                                paddingLeft: 15,
                                paddingRight: 15,
                                paddingBottom: 15,
                            }}
                        >
                            <CustomTimeRangeSelector
                                options={options}
                                handleClose={this.handleRequestClose}
                                onChangeCustom={onChangeCustom}
                                theme={theme}
                            />
                        </div>
                    </Menu>
                </Popover>
            </div>
        );
    }

    getSelectedGranularityLevel() {
        const { getTimeRangeName, getDateTimeRangeInfo } = this.props;
        const selectedTimeRange = getTimeRangeName(getDateTimeRangeInfo().tr) || '';
        if (highGranularityOptions.indexOf(selectedTimeRange) > -1) {
            return 'high';
        } else if (lowGranularityOptions.indexOf(selectedTimeRange) > -1) {
            return 'low';
        } else {
            const defaultValue = this.props.options.defaultValue || '1 Week';
            if (highGranularityOptions.indexOf(defaultValue) > -1) {
                return 'high';
            } else {
                return 'low';
            }
        }
    }

    handleClick(event) {
        event.preventDefault();

        this.setState({
            open: true,
            anchorEl: event.currentTarget,
        });
    }

    handleRequestClose() {
        this.setState({
            open: false,
        });
    }

    generateRightArrow() {
        return (
            <IconButton
                style={{
                    marginRight: 5,
                    verticalAlign: 'middle',
                }}
                onClick={this.switchGranularity}
            >
                <HardwareKeyboardArrowRight />
            </IconButton>
        );
    }

    generateLeftArrow() {
        return (
            <IconButton
                style={{
                    marginRight: 5,
                    verticalAlign: 'middle',
                }}
                onClick={this.switchGranularity}
            >
                <HardwareKeyboardArrowLeft />
            </IconButton>
        );
    }

    generateGranularityModeSwitchButton(granularityMode) {
        return granularityMode === 'low' ? this.generateRightArrow() : this.generateLeftArrow();
    }

    generateTabs(granularityMode) {
        const { getTimeRangeName, getDateTimeRangeInfo, theme } = this.props;
        const selectedTimeRange = getTimeRangeName(getDateTimeRangeInfo().tr) || '';
        const options = granularityMode === 'high' ? highGranularityOptions : lowGranularityOptions;
        return options.map((option) => {
            if (selectedTimeRange === option) {
                return (
                    <FlatButton
                        onClick={() => this.onGranularityModeChange(option)}
                        label={option}
                        style={{ borderBottom: theme.name === 'dark' ? '1px solid red' : '1px solid gray' }}
                    />
                );
            } else {
                return (
                    <FlatButton
                        onClick={() => this.onGranularityModeChange(option)}
                        label={option}
                        style={{ borderBottom: 'none' }}
                    />
                );
            }
        });
    }

    switchGranularity() {
        const { granularityMode } = this.state;
        this.setState({ granularityMode: granularityMode === 'low' ? 'high' : 'low' });
    }

    render() {
        const { granularityMode } = this.state;

        return (
            <div>
                <div>
                    <span
                        style={{ marginRight: 10 }}
                    >
                        Last :
                    </span>
                    {this.generateTabs(granularityMode)}
                    {this.generateGranularityModeSwitchButton(granularityMode)}
                    {this.getCustomSelectButton()}
                </div>
            </div>
        );
    }
}
