import React, { Component } from 'react';
import {
    AppRegistry,
    Text,
    View,
    Button,
    TextInput,
    TouchableHighlight
} from 'react-native';

import styles from "./style.css"

export default class App extends Component {
    state = {
        auth: null 
    }
    startLiking = () => {
        
    }
    likes5 = () => {

    }
    startAuth = () => {
        this.setState({ auth:true });
    }
    render() {
        const { auth } = this.state; 

        return (
            <View style={styles.container}>
                <Text style={styles.welcome}>
                    instalikes
                </Text>
                { (auth === null || auth ===false) &&
                    <View style={styles.content}>
                        <Button onPress={this.startAuth} title="Autheniticate Account" color="rgb(0, 0, 0)" />
                        { auth === false &&
                            <Text> 
                                Authentication failed. Please, try again
                            </Text>
                        }
                    </View>
                }
                {auth === true &&
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



AppRegistry.registerComponent('instalikes', () => App);
