import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    SafeAreaView
} from 'react-native';
import CheckBox from 'react-native-check-box'
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import stringsoflanguages from './locales/stringsoflanguages';

class SignupActivity extends Component {

    constructor(props) {
        super(props);
        this.signupcall = this.signupcall.bind(this);
        this.state = {
            baseUrl: 'https://digimonk.co/fitness/api/Api/register',
            name: '',
            email: '',
            phone: '',
            password: '',
            gender: '',
            location: '',
            device_token: ''
        };
    }


    showLoading() {
        this.setState({ loading: true });
    }

    hideLoading() {
        this.setState({ loading: false });
    }

    static navigationOptions = {
        title: 'Signup'
    };


    componentDidMount() {


    }

    CheckTextInput = () => {
        //Handler for the Submit onPress
        if (this.state.name != '') {
            //Check for the Name TextInput
            if (this.state.email != '') {
                //Check for the Name TextInput
                if (this.state.phone != '') {
                    //check for phone number
                    if (this.state.password != '') {
                        //Check for the Email TextInput
                        if (this.state.password == this.state.confirmpassword) {

                            if (this.state.isChecked) {

                                this.showLoading();
                                if (Platform.OS === 'ios') {
                                    deviceType = 'ios'
                                } else {
                                    deviceType = 'android'
                                }
                                this.signupCall();

                            } else {
                                alert(stringsoflanguages.please_accept_terms);
                            }

                        } else {
                            alert(stringsoflanguages.password_confirm_password_not_match);
                        }
                    } else {
                        alert(stringsoflanguages.please_enter_password);
                    }
                } else {
                    alert(stringsoflanguages.please_enter_phone_number);
                }
            } else {
                alert(stringsoflanguages.please_enter_email);
            }
        } else {
            alert(stringsoflanguages.please_enter_name);
        }
    };




    signupcall() {

        var url = this.state.baseUrl;
        console.log('url:' + url);
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                secure_pin: 'digimonk',
                email_id: this.state.email,
                password: this.state.password,
                device_type: deviceType,
                device_token: this.state.deviceToken
            }),
        })
            .then(response => response.json())
            .then(responseData => {
                this.hideLoading();
                if (responseData.status == '0') {
                    alert(responseData.message);
                } else {
                    this.saveLoginUserData(responseData);
                }


                console.log('response object:', responseData);
            })
            .catch(error => {
                this.hideLoading();
                console.error(error);
            })

            .done();
    }



    render() {
        return (

            <SafeAreaView style={styles.container}>

                <ScrollView>

                    <View style={styles.container}>


                        <View style={{
                            flexDirection: 'column', backgroundColor: '#0381CA',
                            height:50, width: '100%', alignItems:'center', alignContent:'center', justifyContent: 'center'

                        }}>

                            <View style={{ flexDirection: 'row'}}>

                                <TouchableOpacity style={{ flex: .20 }}
                                    onPress={() => {this.props.navigation.navigate('Login')}}>

                                    <Image source={require('../images/back_icon.png')}
                                        style={styles.backIconStyle} />

                                </TouchableOpacity>

                                <View style={{ flex: .60 }}>

                                <Text style={styles.screentitle}>Smart Wristband</Text>

                                </View>


                                <View style={{ flex: .20 }}>


                                </View>

                            </View>

                          

                        </View>

                        </View>

                        <View style={{
                            flexDirection: 'column', alignItems: 'center', backgroundColor: '#ffffff',
                            flex: .60, width: '100%', borderTopRightRadius: 30, borderTopLeftRadius: 30, marginTop: 20
                        }}>

                            <Text style={styles.signuptitle}>Sign Up</Text>

                            <View
                                style={styles.inputView}>

                                <TextInput
                                    placeholder="Name"
                                    placeholderTextColor="#C3C8D1"
                                    underlineColorAndroid="transparent"
                                    style={styles.input}
                                    onChangeText={name => this.setState({ name })}
                                />


                            </View>


                            <View
                                style={styles.inputView1}>

                              
                                <TextInput
                                    placeholder="Email"
                                    placeholderTextColor="#C3C8D1"
                                    underlineColorAndroid="transparent"
                                    style={styles.input}
                                    onChangeText={email => this.setState({ email })}
                                />


                            </View>


                            <View
                                style={styles.inputView1}>

                              
                                <TextInput
                                    placeholder="Phone Number"
                                    placeholderTextColor="#C3C8D1"
                                    underlineColorAndroid="transparent"
                                    style={styles.input}
                                    keyboardType='number-pad'
                                    onChangeText={phone => this.setState({ phone })}
                                />


                            </View>

                            <View
                                style={styles.inputView1}>

                            
                                <TextInput
                                    placeholder="Gender"
                                    placeholderTextColor="#C3C8D1"
                                    underlineColorAndroid="transparent"
                                    style={styles.input}
                                    onChangeText={gender => this.setState({ gender })}
                                />


                            </View>

                            <View
                                style={styles.inputView1}>

                                <TextInput
                                    placeholder="Date of Birth"
                                    placeholderTextColor="#C3C8D1"
                                    underlineColorAndroid="transparent"
                                    style={styles.input}
                                    onChangeText={location => this.setState({ location })}
                                />


                            </View>

                            <View
                                style={styles.inputView1}>

                              
                                <TextInput
                                    placeholder="Password"
                                    placeholderTextColor="#C3C8D1"
                                    underlineColorAndroid="transparent"
                                    style={styles.input}
                                    secureTextEntry={true}
                                    onChangeText={password => this.setState({ password })}
                                />

                            </View>

                            <View
                                style={styles.inputView1}>

                              
                                <TextInput
                                    placeholder="Confirm Password"
                                    placeholderTextColor="#C3C8D1"
                                    underlineColorAndroid="transparent"
                                    style={styles.input}
                                    secureTextEntry={true}
                                    onChangeText={confirmPassword => this.setState({ confirmPassword })}
                                />

                            </View>

                            <View style={{
                                flexDirection: 'row', alignItems: 'center', textAlign: 'center', alignSelf: 'center',
                                marginTop: 15
                            }}>

                                <CheckBox
                                    uncheckedCheckBoxColor={'#0381CA'}
                                    checkedCheckBoxColor={'#0381CA'}
                                    value={this.state.isChecked}
                                    onValueChange={() => this.setState({ isChecked: !this.state.isChecked })}
                                    onClick={() => {
                                        this.setState({ isChecked: !this.state.isChecked })
                                        if (!this.state.isChecked) {

                                        }

                                    }}
                                    isChecked={this.state.isChecked}
                                />

                                <Text
                                    style={{
                                        marginTop: 5, color: '#0381CA', marginHorizontal: 5, textAlign: 'center',
                                        borderBottomWidth: 1, borderColor: '#0381CA'
                                    }}
                                    onPress={() => this.props.navigation.navigate('TermsCondition')}


                                >Accept terms and conditions</Text>


                            </View>



                            <TouchableOpacity
                                style={styles.loginButtonStyle}
                                activeOpacity={.5}
                                onPress={this.CheckTextInput}>


                                <Text style={styles.buttonWhiteTextStyle}>Sign Up</Text>

                            </TouchableOpacity>

                            {/* <Text style={styles.forgotpasswordtext} onPress={() => this.props.navigation.navigate('Forgot Password')}>Forgot Password?</Text> */}


                            <View style={{ flexDirection: 'column', alignItems: 'center' }}>

                                <View style={{ flexDirection: 'row', flex: .5 }}>

                                    {/* <Text style={styles.createnewaccounttext} onPress={() => this.props.navigation.navigate('Signup')}>Don't have an account?</Text>


                                    <Text style={styles.signuptext} onPress={() => this.props.navigation.navigate('Signup')}>Sign Up</Text> */}


                                {/* </View> */}

                            </View>

                        </View>


                    </View>

                </ScrollView>

            </SafeAreaView>

        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    loading: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        opacity: 0.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loading_text: {
        fontSize: RFValue(10, 580),
        textAlign: 'center',
        color: '#FFC33B',
        fontWeight: 'bold'
    },
    input: {
        color: 'black',
        width: 300,
        height: 50,
        padding: 10,
        textAlign: 'left',
        backgroundColor: 'transparent'
    },
    loginButtonStyle: {
        marginTop: 20,
        width: 250,
        height: 40,
        padding: 10,
        backgroundColor: '#0381CA',
        borderRadius: 5,
        justifyContent: 'center',
        alignSelf: 'center',
        alignItems: 'center'
    },
    buttonWhiteTextStyle: {
        textAlign: 'center',
        fontSize: 15,
        color: 'white',
        alignContent: 'center',
    },
    forgotpasswordtext: {
        fontSize: RFPercentage(1.8),
        textAlign: 'center',
        color: '#6F737A',
        marginRight: 10,
        marginTop: 20,
        alignSelf: 'center'
    },
    createnewaccounttext: {
        fontSize: RFPercentage(2),
        textAlign: 'center',
        color: '#6F737A',
        marginRight: 10,
        alignSelf: 'center'
    },
    signuptext: {
        fontSize: RFPercentage(2),
        textAlign: 'center',
        color: '#FB3954',
        marginRight: 10,
        fontWeight: 'bold',
        alignSelf: 'center'
    },

    inputView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        width: '90%',
        marginTop: 40,
        borderRadius: 10,
        elevation: 20,
        shadowColor: 'grey',
        elevation: 20,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1
    },
    inputView1: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        width: '90%',
        marginTop: 20,
        borderRadius: 10,
        elevation: 20,
        shadowColor: 'grey',
        elevation: 20,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1
    },
    ImageIconStyle: {
        height: 30,
        width: 25,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    MailIconStyle: {
        height: 25,
        width: 30,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ImageLockIconStyle: {
        height: 32,
        width: 25,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    screentitle: {
        color: "white",
        fontSize: 20,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    signuptitle: {
        color: '#3F434E',
        fontSize: 20,
        marginTop: 10,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    backIconStyle: {
        height: 25,
        width: 50,
        tintColor: 'white',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoStyle: {
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },

});

export default SignupActivity;
