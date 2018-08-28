/*
 * Copyright (c) 2018, WSO2 Inc. (http://wso2.com) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Widget from '@wso2-dashboards/widget';
import {MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Chip from '@material-ui/core/Chip';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Popper from '@material-ui/core/Popper';
import Paper from '@material-ui/core/Paper';
import Select from 'react-select';
import JssProvider from 'react-jss/lib/JssProvider';
import {Scrollbars} from 'react-custom-scrollbars';

const darkTheme = createMuiTheme({
    palette: {
        type: 'dark'
    }
});

const lightTheme = createMuiTheme({
    palette: {
        type: 'light'
    }
});

const allOption = [{
    value: 'All',
    label: 'All',
    disabled: false
}];

let openPopper = false;

function NoOptionsMessage(props) {
    return (
        <Typography
            style={{
                padding: 15,
                color: '#7e7e7e'
            }}
            {...props.innerProps}>
            {props.children}
        </Typography>
    );
}

function inputComponent({inputRef, ...props}) {
    return <div
        ref={inputRef}
        {...props}/>;
}

function Control(props) {
    openPopper = props.selectProps.menuIsOpen;
    return (
        <TextField
            id='popper-anchor-http-request-count-filter'
            style={{display: 'flex'}}
            fullWidth={true}
            InputProps={{
                inputComponent,
                inputProps: {
                    inputRef: props.innerRef,
                    children: props.children,
                    ...props.innerProps,
                },
            }}
            {...props.selectProps.textFieldProps}/>
    );
}

function Option(props) {
    return (
        <MenuItem
            buttonRef={props.innerRef}
            selected={props.isFocused}
            component='div'
            style={{fontWeight: props.isSelected ? 500 : 400}}
            {...props.innerProps}>
            {props.children}
        </MenuItem>
    );
}

function Placeholder(props) {
    return (
        <Typography
            style={{
                position: 'absolute',
                left: 2,
                fontSize: '90%',
                color: '#7e7e7e'
            }}
            {...props.innerProps}>
            {props.children}
        </Typography>
    );
}

function SingleValue(props) {
    return (
        <Typography
            style={{
                display: 'flex',
                flexWrap: 'wrap',
                color: 'white',
                fontSize: '95%'
            }}
            {...props.innerProps}>
            {props.children}
        </Typography>
    );
}

function ValueContainer(props) {
    return (
        <div
            style={{
                display: 'flex',
                flexWrap: 'wrap',
                flex: 1,
                alignItems: 'center',
            }}>
            {props.children}
        </div>);
}

function MultiValue(props) {
    return (
        <Chip
            tabIndex={-1}
            label={props.children}
            onDelete={event => {
                props.removeProps.onClick();
                props.removeProps.onMouseDown(event);
            }}
            style={{
                borderRadius: 15,
                display: 'flex',
                flexWrap: 'wrap',
                fontSize: '90%',
                overflow: 'hidden',
                paddingLeft: 6,
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                minWidth: '20',
                margin: 2
            }}/>
    );
}

function Menu(props) {
    let popperNode = document.getElementById('popper-anchor-http-request-count-filter');
    return (
        <Popper
            open={openPopper}
            anchorEl={popperNode}>
            <Paper
                square
                style={{width: popperNode ? popperNode.clientWidth : null}}
                {...props.innerProps}>
                {props.children}
            </Paper>
        </Popper>
    );
}

const components = {
    Option,
    Control,
    NoOptionsMessage,
    Placeholder,
    SingleValue,
    MultiValue,
    ValueContainer,
    Menu,
};

/**
 * HTTPAnalyticsRequestCountFilter which renders the perspective and filter in home page
 */
class HTTPAnalyticsRequestCountFilter extends Widget {
    constructor(props) {
        super(props);
        this.state = {
            width: this.props.glContainer.width,
            height: this.props.glContainer.height,
            perspective: 0,
            servers: [],
            serverOptions: [],
            selectedServerValues: null,
            services: [],
            serviceOptions: [],
            selectedServiceValues: null,
            selectedSingleServiceValue: null,
            faultyProviderConf: false
        };

        this.props.glContainer.on('resize', () =>
            this.setState({
                width: this.props.glContainer.width,
                height: this.props.glContainer.height
            })
        );
        this.handleChange = this.handleChange.bind(this);
        this.handleDataReceived = this.handleDataReceived.bind(this);
        this.publishUpdate = this.publishUpdate.bind(this);
    }

    /**
     * Publish user selection to other widgets
     */
    publishUpdate() {
        let filterOptions = {
            perspective: this.state.perspective,
            selectedServerValues: this.state.selectedServerValues,
            selectedServiceValues: this.state.selectedServiceValues,
            selectedSingleServiceValue: this.state.selectedSingleServiceValue
        };
        super.publish(filterOptions);
    }

    /**
     * Set the state of the widget after metadata and data is received from SiddhiAppProvider
     * @param data
     */
    handleDataReceived(data) {
        let servers = [], services = [], serverOptions, serviceOptions;
        data.data.map(dataUnit => {
            servers.push(dataUnit[0]);
            services.push(dataUnit[1]);
        });
        servers.push('All');
        services.push('All');

        servers = servers.filter((v, i, a) => a.indexOf(v) === i);
        services = services.filter((v, i, a) => a.indexOf(v) === i);

        serverOptions = servers.map(server => ({
            value: server,
            label: server,
            disabled: false
        }));

        serviceOptions = services.map(service => ({
            value: service,
            label: service,
            disabled: false
        }));

        this.setState({
            servers: servers,
            services: services,
            serviceOptions: serviceOptions,
            serverOptions: serverOptions,
            selectedServerValues: allOption,
            selectedServiceValues: allOption,
            selectedSingleServiceValue: allOption[0]
        }, this.publishUpdate);
    }

    /**
     * Publish user selection in filters
     * @param values
     */
    handleChange = name => values => {
        let options;
        let selectedOptionLabelName;
        let selectedOptionsName;
        let selectedValues;

        if (name === 0) {
            options = this.state.services;
            selectedOptionLabelName = 'selectedServiceValues';
            selectedOptionsName = 'serviceOptions';
            selectedValues = values;
        } else if (name === 1) {
            options = this.state.servers;
            selectedOptionLabelName = 'selectedServerValues';
            selectedOptionsName = 'serverOptions';
            selectedValues = values;
        } else {
            options = this.state.services;
            selectedOptionLabelName = 'selectedSingleServiceValue';
            selectedOptionsName = 'serviceOptions';
            selectedValues = new Array(1);
            selectedValues[0] = values;
        }

        let updatedOptions;
        if (selectedValues.some(value => value.value === 'All')) {
            updatedOptions = options.map(option => ({
                value: option,
                label: option,
                disabled: true
            }));
            this.setState({
                [selectedOptionLabelName]: [{
                    value: 'All',
                    label: 'All',
                    disabled: false
                }],
                [selectedOptionsName]: updatedOptions
            }, this.publishUpdate)
        } else {
            updatedOptions = options.map(option => ({
                value: option,
                label: option,
                disabled: false
            }));
            this.setState({
                [selectedOptionLabelName]: values,
                [selectedOptionsName]: updatedOptions
            }, this.publishUpdate);
        }
    };

    componentDidMount() {
        super.getWidgetConfiguration(this.props.widgetID)
            .then((message) => {
                super.getWidgetChannelManager()
                    .subscribeWidget(this.props.id, this.handleDataReceived, message.data.configs.providerConfig);
            })
            .catch((error) => {
                this.setState({
                    faultyProviderConf: true
                });
            });
    }

    componentWillUnmount() {
        super.getWidgetChannelManager().unsubscribeWidget(this.props.id);
    }

    render() {
        const {classes} = this.props;
        return (
            <JssProvider
                generateClassName={generateClassName}>
                <MuiThemeProvider
                    theme={this.props.muiTheme.name === 'dark' ? darkTheme : lightTheme}>
                    <Scrollbars
                        style={{height: this.state.height}}>
                        <div
                            style={{
                                paddingLeft: 24,
                                paddingRight: 16
                            }}>
                            <Tabs
                                value={this.state.perspective}
                                onChange={(evt, value) => this.setState({perspective: value}, this.publishUpdate)}>
                                <Tab label='Service'/>
                                <Tab label='Server'/>
                                <Tab label='Method'/>
                            </Tabs>
                            <div
                                style={{paddingLeft: 10, paddingRight: 16, paddingTop: 3}}>
                                {
                                    this.state.perspective === 0 &&
                                    <Select
                                        classes={classes}
                                        className='autocomplete'
                                        classNamePrefix='autocomplete'
                                        textFieldProps={{
                                            label: '',
                                            InputLabelProps: {
                                                shrink: false,
                                            },
                                        }}
                                        options={this.state.serviceOptions}
                                        components={components}
                                        value={this.state.selectedServiceValues}
                                        onChange={this.handleChange(0)}
                                        placeholder='Filter by Service'
                                        isMulti
                                    />
                                }
                                {
                                    this.state.perspective === 1 &&
                                    <Select
                                        classes={classes}
                                        className='autocomplete'
                                        classNamePrefix='autocomplete'
                                        textFieldProps={{
                                            label: '',
                                            InputLabelProps: {
                                                shrink: false,
                                            },
                                        }}
                                        options={this.state.serverOptions}
                                        components={components}
                                        value={this.state.selectedServerValues}
                                        onChange={this.handleChange(1)}
                                        placeholder='Filter by Server'
                                        isMulti
                                    />
                                }
                                {
                                    this.state.perspective === 2 &&
                                    <Select
                                        classes={classes}
                                        className='autocomplete'
                                        classNamePrefix='autocomplete'
                                        textFieldProps={{
                                            label: '',
                                            InputLabelProps: {
                                                shrink: false,
                                            },
                                        }}
                                        options={this.state.serviceOptions}
                                        components={components}
                                        value={this.state.selectedSingleServiceValue}
                                        onChange={this.handleChange(2)}
                                        placeholder='Choose a Service'
                                    />
                                }
                            </div>
                        </div>
                    </Scrollbars>
                </MuiThemeProvider>
            </JssProvider>
        );
    }
}

//This is the workaround suggested in https://github.com/marmelab/react-admin/issues/1782
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


HTTPAnalyticsRequestCountFilter.propTypes = {
    classes: PropTypes.object.isRequired,
};
global.dashboard.registerWidget('HTTPAnalyticsRequestCountFilter', HTTPAnalyticsRequestCountFilter);
