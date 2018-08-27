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
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Chip from '@material-ui/core/Chip';
import Paper from "@material-ui/core/Paper";
import Popper from "@material-ui/core/Popper";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Select from 'react-select';
import {Scrollbars} from 'react-custom-scrollbars';
import JssProvider from 'react-jss/lib/JssProvider';

const darkTheme = createMuiTheme({
    palette: {
        type: "dark"
    }
});

const lightTheme = createMuiTheme({
    palette: {
        type: "light"
    }
});

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
            id='popper-anchor-http-response-code-filter'
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
    let popperNode = document.getElementById('popper-anchor-http-response-code-filter');
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
 * HTTPAnalyticsResponseCodeFilter which renders the perspective and filter in response code analytics page
 */
class HTTPAnalyticsResponseCodeFilter extends Widget {
    constructor(props) {
        super(props);
        this.state = {
            width: this.props.glContainer.width,
            height: this.props.glContainer.height,
            perspective: 3,
            services: [],
            serviceOptions: [],
            selectedServiceValues: null,
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
            selectedServiceValues: this.state.selectedServiceValues,
        };
        super.publish(filterOptions);
    }

    /**
     * Set the state of the widget after metadata and data is received from SiddhiAppProvider
     * @param data
     */
    handleDataReceived(data) {
        let services = [], serviceOptions;
        data.data.map(dataUnit => {
            services.push(dataUnit[1]);
        });

        services = services.filter((v, i, a) => a.indexOf(v) === i);
        serviceOptions = services.map(service => ({
            value: service,
            label: service,
            disabled: false
        }));

        this.setState({
            services, serviceOptions
        }, this.publishUpdate);
    }

    /**
     * Publish user selection in filters
     * @param values
     */
    handleChange(values) {
        let updatedOptions = this.state.services.map(option => ({
            value: option,
            label: option,
            disabled: false
        }));
        this.setState({
            selectedServiceValues: values,
            serviceOptions: updatedOptions
        }, this.publishUpdate);
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
                                value={this.state.perspective}>
                                <Tab
                                    value={3}
                                    label="Response Code"/>
                            </Tabs>
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
                                onChange={this.handleChange}
                                placeholder='Filter by Service'
                            />
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

HTTPAnalyticsResponseCodeFilter.propTypes = {
    classes: PropTypes.object.isRequired,
};
global.dashboard.registerWidget("HTTPAnalyticsResponseCodeFilter", HTTPAnalyticsResponseCodeFilter);
