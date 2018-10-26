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

/* eslint-disable react/prop-types */
import React from 'react';
import { RaisedButton } from 'material-ui';
import DateTimePicker from './DateTimePicker';
import Moment from "moment";

export default class CustomTimeRangeSelector extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            invalidDateRange: false
        };

        this.startTime = Moment().subtract(1, 'days').toDate();
        this.endTime = new Date();
        this.handleStartTimeChange = this.handleStartTimeChange.bind(this);
        this.handleEndTimeChange = this.handleEndTimeChange.bind(this);
        this.publishCustomTimeRange = this.publishCustomTimeRange.bind(this);
    }

    handleStartTimeChange(date) {
        this.startTime = date;
        if(Moment(this.startTime).unix() >=
            Moment(this.endTime).unix()) {
            this.setState({ invalidDateRange: true });
        } else {
            this.setState({ invalidDateRange: false });
        }
    }

    handleEndTimeChange(date) {
        this.endTime = date;
        if(Moment(this.startTime).unix() >=
            Moment(this.endTime).unix()) {
            this.setState({ invalidDateRange: true });
        } else {
            this.setState({ invalidDateRange: false });
        }
    }

    publishCustomTimeRange() {
        const { handleClose, onChangeCustom } = this.props;
        handleClose();
        onChangeCustom(this.startTime, this.endTime);
    }

    render() {
        const { theme } = this.props;
        return (
            <div
                style={{ marginTop: 10 }}
            >
                <div style={{ display: 'flex'}}>
                    <div
                        style={{
                            width: '50%',
                            float: 'left',
                        }}
                    >
                        From
                        <br />
                        <DateTimePicker
                            onChange={this.handleStartTimeChange}
                            theme={theme}
                            initTime = {Moment().subtract(1, 'days')}
                            inputName='startTime'
                        />
                    </div>
                    <div
                        style={{
                            width: '50%',
                            float: 'right',
                        }}
                    >
                        To
                        <br />
                        <DateTimePicker
                            onChange={this.handleEndTimeChange}
                            theme={theme}
                            initTime = {Moment()}
                            inputName='endTime'
                            startTime={this.startTime}
                        />
                    </div>
                </div>
                {this.state.invalidDateRange ? <div style={{color: '#dc3545', paddingTop: 10}}>
                    Invalid date range, Please select a valid date range. </div> : ''}
                <RaisedButton
                    primary
                    style={{
                        marginTop: 10,
                        marginBottom: 10,
                        float: 'right',
                    }}
                    disabled={this.state.invalidDateRange}
                    onClick={this.publishCustomTimeRange}
                >
                    Apply
                </RaisedButton>
            </div>
        );
    }
}
