import { useState } from 'react';

const Events = () => {
  const [showForm, setShowForm] = useState(false);
  const [eventData, setEventData] = useState({
    event_name: '',
    description: '',
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    food_services: [],
    event_inventory: []
  });

  // Dummy main inventory data (replace with your fetched data as needed)
  const mainInventory = [
    {
      id: "67a668e93b2a3667bd1d4c2f",
      foodbank_id: "67998e82f6196c9a5c6017a1",
      food_name: "Apple",
      quantity: 200
    },
    {
      id: "67a81cf8a440bb6d35f24530",
      foodbank_id: "67a7a68b7e2bfbb24275273a",
      food_name: "Beef Box",
      quantity: 50
    }
    // ... add the rest of your items
  ];

  // Function to handle drag start
  const onDragStart = (e, item) => {
    e.dataTransfer.setData("item", JSON.stringify(item));
  };

  // When an item is dropped, add it to the event inventory with a default allocatedQuantity
  const onDrop = (e) => {
    e.preventDefault();
    const item = JSON.parse(e.dataTransfer.getData("item"));
    const eventItem = { ...item, allocatedQuantity: 1 };
    setEventData((prev) => ({
      ...prev,
      event_inventory: [...prev.event_inventory, eventItem]
    }));
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  // Remove an item from the event inventory (effectively "returning" it to the main inventory)
  const handleRemoveItem = (index) => {
    setEventData((prev) => {
      const newInventory = [...prev.event_inventory];
      newInventory.splice(index, 1);
      return { ...prev, event_inventory: newInventory };
    });
  };

  // Reset the form and clear any allocated items if the user cancels the process
  const handleCancel = () => {
    setEventData({
      event_name: '',
      description: '',
      date: '',
      start_time: '',
      end_time: '',
      location: '',
      food_services: [],
      event_inventory: []
    });
    setShowForm(false);
  };

  // On form submission, prepare the request body and (here) log it out.
  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedInventory = eventData.event_inventory.map((item) => ({
      food_name: item.food_name,
      quantity: item.allocatedQuantity || 1
    }));
    const requestBody = {
      ...eventData,
      event_inventory: formattedInventory
    };
    console.log("Submitting event:", requestBody);
    // Place your API call logic here...
    // Reset the form after submitting:
    handleCancel();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Manage Events</h1>
      {!showForm && (
        <div className="text-center">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => setShowForm(true)}
          >
            Create New Event
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-8 max-w-3xl mx-auto">
          {/* Event Details */}
          <div className="mb-4">
            <label htmlFor="event_name" className="block font-bold mb-1">
              Event Name
            </label>
            <input
              type="text"
              id="event_name"
              name="event_name"
              placeholder="Community Feast 4"
              value={eventData.event_name}
              onChange={(e) =>
                setEventData({ ...eventData, event_name: e.target.value })
              }
              className="border p-2 w-full rounded"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block font-bold mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="A place to share"
              value={eventData.description}
              onChange={(e) =>
                setEventData({ ...eventData, description: e.target.value })
              }
              className="border p-2 w-full rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="date" className="block font-bold mb-1">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={eventData.date}
                onChange={(e) =>
                  setEventData({ ...eventData, date: e.target.value })
                }
                className="border p-2 w-full rounded"
              />
            </div>
            <div>
              <label htmlFor="location" className="block font-bold mb-1">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                placeholder="Yonge and Finch"
                value={eventData.location}
                onChange={(e) =>
                  setEventData({ ...eventData, location: e.target.value })
                }
                className="border p-2 w-full rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="start_time" className="block font-bold mb-1">
                Start Time
              </label>
              <input
                type="time"
                id="start_time"
                name="start_time"
                value={eventData.start_time}
                onChange={(e) =>
                  setEventData({ ...eventData, start_time: e.target.value })
                }
                className="border p-2 w-full rounded"
              />
            </div>
            <div>
              <label htmlFor="end_time" className="block font-bold mb-1">
                End Time
              </label>
              <input
                type="time"
                id="end_time"
                name="end_time"
                value={eventData.end_time}
                onChange={(e) =>
                  setEventData({ ...eventData, end_time: e.target.value })
                }
                className="border p-2 w-full rounded"
              />
            </div>
          </div>

          {/* Food Services Selection */}
          <div className="mb-4">
            <span className="block font-bold mb-1">Food Services</span>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  value="Hot meals"
                  checked={eventData.food_services.includes("Hot meals")}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setEventData({
                        ...eventData,
                        food_services: [
                          ...eventData.food_services,
                          "Hot meals"
                        ]
                      });
                    } else {
                      setEventData({
                        ...eventData,
                        food_services: eventData.food_services.filter(
                          (item) => item !== "Hot meals"
                        )
                      });
                    }
                  }}
                  className="mr-1"
                />
                Hot meals
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  value="Snacks"
                  checked={eventData.food_services.includes("Snacks")}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setEventData({
                        ...eventData,
                        food_services: [
                          ...eventData.food_services,
                          "Snacks"
                        ]
                      });
                    } else {
                      setEventData({
                        ...eventData,
                        food_services: eventData.food_services.filter(
                          (item) => item !== "Snacks"
                        )
                      });
                    }
                  }}
                  className="mr-1"
                />
                Snacks
              </label>
            </div>
          </div>

          {/* Drag and Drop for Event Inventory */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-2">Event Inventory</h2>
            <div className="flex space-x-4">
              {/* Main Inventory List */}
              <div className="w-1/2 border p-4 rounded">
                <h3 className="font-semibold mb-2">Main Inventory</h3>
                <ul>
                  {mainInventory.map((item) => (
                    <li
                      key={item.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, item)}
                      className="border p-2 mb-2 cursor-move hover:bg-gray-100"
                    >
                      <span className="font-medium">{item.food_name}</span> -{' '}
                      <span>{item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Drop Zone for Allocated Items */}
              <div
                className="w-1/2 border p-4 rounded min-h-[200px]"
                onDrop={onDrop}
                onDragOver={onDragOver}
              >
                <h3 className="font-semibold mb-2">Drop Items Here</h3>
                {eventData.event_inventory.length === 0 ? (
                  <p className="text-gray-500">No items added yet.</p>
                ) : (
                  <ul>
                    {eventData.event_inventory.map((item, index) => (
                      <li
                        key={index}
                        className="border p-2 mb-2 bg-gray-50 flex justify-between items-center"
                      >
                        <div>
                          <span className="font-medium">{item.food_name}</span>
                          <span className="text-sm text-gray-600 ml-2">
                            (Available: {item.quantity})
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="mr-2 text-sm">Quantity:</label>
                          <input
                            type="number"
                            min="1"
                            max={item.quantity}
                            value={item.allocatedQuantity || 1}
                            onChange={(e) => {
                              const newQuantity =
                                parseInt(e.target.value, 10) || 1;
                              setEventData((prev) => {
                                const newInventory = [...prev.event_inventory];
                                newInventory[index].allocatedQuantity = newQuantity;
                                return { ...prev, event_inventory: newInventory };
                              });
                            }}
                            className="border p-1 w-20"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Form Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Cancel Process
            </button>
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Submit Event
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Events;
