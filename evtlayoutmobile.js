var configmobile = {
        settings: {
            showPopoutIcon: false,
            showMaximiseIcon: false,
            showCloseIcon: false
        },
        content: [{
            type: 'row',
            content: [
                {
                    type: 'column',
                    content: [{
                        type: 'stack',
                        width: 100,
                        height: 75,
                        content: [{
                            type: 'component',
                            componentName: 'interceptedMessage',
                            componentState: {},
                            isClosable: false,
                            title: 'Intercepted Msg'
                        }, {
                            type: 'component',
                            componentName: 'logComponent',
                            componentState: {type: 'diagnostic'},
                            isClosable: false,
                            title: 'Diagnostic Report'
                        }, {
                            type: 'component',
                            componentName: 'logComponent',
                            componentState: {type: 'info'},
                            isClosable: false,
                            title: 'Log - Info'
                        }, {
                            type: 'component',
                            componentName: 'logComponent',
                            componentState: {type: 'warning'},
                            isClosable: false,
                            title: 'Log - Warning'
                        }, {
                            type: 'component',
                            componentName: 'logComponent',
                            componentState: {type: 'error'},
                            isClosable: false,
                            title: 'Log - Error'
                        }]
                    }]
                }]
        }]
    }
;
