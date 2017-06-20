import React, { Component } from 'react';
import {
    AppRegistry,
    Text,
    View,
    Button,
    TextInput,
    TouchableHighlight
} from 'react-native';

import AuthHOC, { STATUS as AUTH_STATUS } from './AuthHOC'

import styles from "./style.css"

export default class App extends Component {
    startLiking = () => {

    }
    likes5 = () => {

    }
    render() {
        const { auth } = this.props;

        console.log('this.props:', this.props);
        return (
            <View style={styles.container}>
                <Text style={styles.welcome}>
                    instalikes
                </Text>
                { auth.status !== AUTH_STATUS.OK &&
                    <View style={styles.content}>
                        <Button onPress={auth.start} title="Autheniticate Account" color="rgb(0, 0, 0)" />
                        { auth.status === AUTH_STATUS.UNINIT &&
                            <Text>InstaLikes needs you to grant permission to your Instagram account in order to "Like" on your behalf.</Text>
                        }
                        { auth.status === AUTH_STATUS.FAIL &&
                            <Text>Authentication failed. Please, try again. Reason: {auth.fail_msg}</Text>
                        }
                        { auth.status === AUTH_STATUS.OPEN &&
                            <Text>Opening authorization page in browser...</Text>
                        }
                        { auth.status === AUTH_STATUS.OPENED &&
                            <Text>The authorization tab has been opened in your browser. If it has not, please try again.</Text>
                        }
                        { auth.status === AUTH_STATUS.CALC &&
                            <Text>Getting authorization page from Twittwe servers...</Text>
                        }
                    </View>
                }
                {auth.status === AUTH_STATUS.OK &&
                    <View style={styles.contentAction}>
                        <Text style={styles.hashText}>
                            Hashtag:
                        </Text>
                        <TextInput style={styles.textBox}/>
                         <TouchableHighlight style={styles.buttonRound} onPress={this.likes5}>
                             <View style={styles.buttonRoundBG} />
                        </TouchableHighlight>
                        <View style={styles.spacer} />
                        <Button title="Start Liking" style={styles.buttonAction} onPress={this.startLiking} />
                        <View style={styles.contentActionBottomMargin} />
                    </View>
                }
            </View>
        );
    }
}

AppRegistry.registerComponent('instalikes', () => AuthHOC(App));
