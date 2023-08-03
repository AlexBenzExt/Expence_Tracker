import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import React, {Component} from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Iprops {}

interface Istate {
  name: string;
  amount: number;
  modal: boolean;
  transactions: {}[];
  totalAmount: number;
  warning: string;
  type: string;
  numberError:string
}

export default class Expense extends Component<Iprops, Istate> {
  state = {
    name: '',
    amount: 0,
    modal: false,
    transactions: [],
    totalAmount: 0,
    warning: '',
    type: '',
    numberError:""
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    const data: {amount: string; id: string; name: string; type: string} | any =
      await AsyncStorage.getItem('transactions');
    const total: string | number | any = await AsyncStorage.getItem(
      'totalAmount',
    );
    const ParseData = await JSON.parse(data);
    this.setState({
      transactions: ParseData || [],
      totalAmount: JSON.parse(total) || 0,
    });
  };

  openModal = (value: string) => {
    this.setState({modal: true, type: value});
  };
  closeModal = () => {
    this.setState({modal: false, warning: ''});
  };

  nameHandler = (text: string) => {
    this.setState({name: text});
  };

  amountHandler = (text: number | any) => {
    this.setState({amount: text});
  };

  addHandler = async () => {
    const {name, amount, totalAmount, type} = this.state;
    const id = Date.now();

  if((isNaN(Number(amount)))){
    this.setState({numberError:"please provide number in amount field"});
    return
  }else{
    this.setState({numberError:""})
  }

  const day=new Date().getDate();
  const month=new Date().getMonth()+1;
  const year = new Date().getFullYear();
  const date=day+'-'+month+'-'+year;
  const data = {id, name, amount, type,date};

    if (name !== '' && amount !== 0) {
      if (type == 'credit') {
        const total = Number(amount) + Number(totalAmount);
        this.setState(prevState => ({
          transactions: [...prevState.transactions, data],
          totalAmount: total,
          modal: false,
          warning: '',
        }));
        this.updateASync();
      } else {
        const total = Number(totalAmount) - Number(amount);
        if (total < 0) {
          this.setState({warning: 'insufficient balance'});
        } else {
          this.setState(prevState => ({
            transactions: [...prevState.transactions, data],
            totalAmount: total,
            modal: false,
            warning: '',
          }));

          this.updateASync();
        }
      }
    } else {
      this.setState({warning: 'please fill the details'});
    }
  };

  renderList = (item: any) => {
    const name = `${item.item.type == 'credit' ? 'downcircle' : 'upcircle'}`;
    const color = `${item.item.type == 'credit' ? 'green' : 'red'}`;
    const symbol = `${item.item.type == 'credit' ? '+' : '-'}`;
    const day=new Date().getDate();
    const month=new Date().getMonth()+1;
    const year = new Date().getFullYear();
    const date=day+'-'+month+'-'+year;
    const val=item.item.date.charAt(0);
    const monthVal=item.item.date.charAt(2)
    console.log(monthVal,month)
    let time=item.item.date
    if(item.item.date==date){
      time="Today"
    }else if(Number(val)+1==Number(day) && Number(monthVal)+1 !== Number(month)){
     time="Yesterday"
    }
    return (
      <View style={styles.renderContainer}>
        <AntDesign name={name} size={40} color={color} />
        <View style={styles.nameContainer}>
        <Text style={styles.name}>{item.item.name}</Text>
        <Text style={styles.date}>{time}</Text>
        </View>
        <Text style={[styles.Rname, {color: color}]}>
          {symbol} $ {item.item.amount}
        </Text>
      </View>
    );
  };

  updateASync = async () => {
    const {totalAmount, transactions} = this.state;
    const StringTarns = await JSON.stringify(transactions);
    await AsyncStorage.setItem('transactions', StringTarns);
    await AsyncStorage.setItem('totalAmount', JSON.stringify(totalAmount));
  };

  render() {
    const {totalAmount, transactions} = this.state;
    this.updateASync();
    return (
      <View style={styles.main}>
        <View style={styles.topContainer}>
          <Text style={styles.heading}>Wallet</Text>
        </View>
        <View style={styles.expenseContainer}>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceTxt}>Total Balance</Text>
            <Text style={styles.balance}>$ {totalAmount}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => this.openModal('credit')}>
              <Image
                source={require('../../assets/images/add.png')}
                style={{width: 50, height: 50}}
              />
              <Text>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => this.openModal('debit')}>
              <Image
                source={require('../../assets/images/pay.png')}
                style={{width: 50, height: 50}}
              />
              <Text>pay</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
              <Image
                source={require('../../assets/images/send.png')}
                style={{width: 50, height: 50}}
              />
              <Text>send</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.slideContainer}>
            <View style={styles.slide}>
              <Text style={styles.slideTxt}>Transactions</Text>
            </View>
            <Text style={styles.slideTxt}>Upcoming Bills</Text>
          </View>
          <View>
            <Modal
              animationType="slide"
              transparent={true}
              visible={this.state.modal}>
              <View style={styles.modal}>
                <TextInput
                  placeholder="enter name"
                  style={styles.modalInput}
                  onChangeText={this.nameHandler}
                />
                <TextInput
                  placeholder="enter amount"
                  style={styles.modalInput}
                  keyboardType='numeric'
                  onChangeText={this.amountHandler}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalbutton}
                    onPress={this.addHandler}>
                    <Text style={styles.modalBtnTxt}>confirm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalbutton}
                    onPress={this.closeModal}>
                    <Text style={styles.modalBtnTxt}>cancel</Text>
                  </TouchableOpacity>
                </View>
               {this.state.warning!=="" ?  <Text style={styles.warning}>{this.state.warning}</Text> :
                <Text style={styles.warning}>{this.state.numberError}</Text>}
              </View>
            </Modal>
          </View>
          <View style={styles.renderFlat}>
            {transactions !== null && (
              <FlatList
                data={transactions}
                keyExtractor={(item:any) => item.id}
                renderItem={item => this.renderList(item)}
              />
            )}
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  main: {
    backgroundColor: 'rgba(66, 150, 144, 1)',
    flex: 1,
  },
  topContainer: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    color: 'white',
    fontSize: 25,
    fontWeight: '600',
    lineHeight: 21,
  },
  expenseContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopEndRadius: 25,
    borderTopLeftRadius: 25,
  },
  balanceContainer: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceTxt: {
    fontSize: 15,
  },
  balance: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'black',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
  },
  button: {
    alignItems: 'center',
    gap: 10,
  },
  slideContainer: {
    marginTop: 20,
    backgroundColor: 'rgba(244, 246, 246, 1)',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    borderRadius: 25,
    width: '90%',
    height: 50,
    alignItems: 'center',
    alignSelf: 'center',
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    width: '50%',
    height: 40,
    borderRadius: 50,
  },
  slideTxt: {
    fontSize: 15,
  },
  modal: {
    backgroundColor: 'hsla(223, 100%, 88%, 1)',
    width: '80%',
    height: 290,
    marginTop: 200,
    alignSelf: 'center',
    padding: 30,
    gap: 30,
    borderRadius: 20,
  },
  modalInput: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingLeft: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  modalbutton: {
    backgroundColor: 'hsla(209, 100%, 62%, 1)',
    width: '45%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
  },
  modalBtnTxt: {
    color: 'white',
    fontSize: 15,
  },

  warning: {
    color: 'red',
    textAlign: 'center',
  },
  renderContainer: {
    padding: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems:"center"
    // gap:50
  },
  Rname: {
    fontSize: 25,
  },
  renderFlat: {
    marginBottom: 40,
  },

  nameContainer:{
    alignSelf:"flex-start",
    flex:1,
    marginLeft:20
  },
  name:{
    fontSize: 25,
    color:"black",
  },
  date:{
    fontSize:15
  }
});
