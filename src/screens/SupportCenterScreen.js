import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Button, Card, Icon, Overlay } from 'react-native-elements';
import axios from 'axios';

const SupportCenterScreen = ({ navigation }) => {
  const [tickets, setTickets] = useState([]);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [newTicket, setNewTicket] = useState({
    issueType: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await axios.get('/api/support/tickets/user');
      setTickets(response.data.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const createTicket = async () => {
    try {
      setLoading(true);
      await axios.post('/api/support/tickets', newTicket);
      setCreateModalVisible(false);
      setNewTicket({ issueType: '', description: '' });
      fetchTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: '#ff4444',
      pending: '#ffbb33',
      resolved: '#00C851',
      escalated: '#CC0000'
    };
    return colors[status] || '#000';
  };

  const renderTicketItem = ({ item }) => (
    <Card>
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketType}>{item.issueType.replace('_', ' ').toUpperCase()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.description}>{item.description}</Text>
      <View style={styles.ticketFooter}>
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        {item.status !== 'resolved' && (
          <TouchableOpacity 
            style={styles.viewButton}
            onPress={() => navigation.navigate('TicketDetail', { ticketId: item._id })}
          >
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );

  const CreateTicketModal = () => (
    <Overlay
      isVisible={isCreateModalVisible}
      onBackdropPress={() => setCreateModalVisible(false)}
      overlayStyle={styles.modal}
    >
      <ScrollView>
        <Text style={styles.modalTitle}>Create Support Ticket</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Issue Type</Text>
          <View style={styles.pickerContainer}>
            {[
              'booking_issue',
              'payment_issue',
              'service_quality',
              'technical_issue',
              'other'
            ].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  newTicket.issueType === type && styles.selectedType
                ]}
                onPress={() => setNewTicket({ ...newTicket, issueType: type })}
              >
                <Text style={[
                  styles.typeButtonText,
                  newTicket.issueType === type && styles.selectedTypeText
                ]}>
                  {type.replace('_', ' ').toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            value={newTicket.description}
            onChangeText={(text) => setNewTicket({ ...newTicket, description: text })}
            placeholder="Describe your issue..."
          />
        </View>
        <Button
          title="Submit Ticket"
          onPress={createTicket}
          loading={loading}
          disabled={!newTicket.issueType || !newTicket.description}
          buttonStyle={styles.submitButton}
        />
      </ScrollView>
    </Overlay>
  );

  return (
    <View style={styles.container}>
      <Button
        title="Create New Ticket"
        icon={<Icon name="add" color="#fff" />}
        onPress={() => setCreateModalVisible(true)}
        buttonStyle={styles.createButton}
      />
      <FlatList
        data={tickets}
        renderItem={renderTicketItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
      />
      <CreateTicketModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  listContainer: {
    padding: 10
  },
  createButton: {
    margin: 15,
    backgroundColor: '#2196F3'
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  ticketType: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  description: {
    marginBottom: 10,
    color: '#666'
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10
  },
  date: {
    color: '#999',
    fontSize: 12
  },
  viewButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 12
  },
  modal: {
    width: '90%',
    maxHeight: '80%'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  inputContainer: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500'
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10
  },
  typeButton: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 20,
    margin: 4
  },
  selectedType: {
    backgroundColor: '#2196F3'
  },
  typeButtonText: {
    color: '#666',
    fontSize: 12
  },
  selectedTypeText: {
    color: '#fff'
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top'
  },
  submitButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    marginTop: 10
  }
});

export default SupportCenterScreen;