// import React from 'react';

// const FoodBankList = ({ foodBanks, onSelect, getDirections }) => {
//   return (
//     <div style={{ padding: '1rem' }}>
//       <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#333' }}>Food Banks</h2>
//       <ul style={{ listStyleType: 'none', padding: 0 }}>
//         {foodBanks.map((foodBank, index) => (
//           <li
//             key={index}
//             style={{
//               marginBottom: '1rem',
//               border: '1px solid #ddd',
//               borderRadius: '8px',
//               padding: '1rem',
//               backgroundColor: '#fff',
//               boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
//             }}
//           >
//             <div>
//               <strong
//                 style={{ fontSize: '1.2rem', color: '#007bff', cursor: 'pointer' }}
//                 onClick={() => onSelect(foodBank)}
//               >
//                 {foodBank.name}
//               </strong>
//               <p style={{ color: '#555', margin: '0.5rem 0' }}>{foodBank.address}</p>
//               <button
//                 onClick={() => getDirections(foodBank)}
//                 style={{
//                   padding: '10px 15px',
//                   backgroundColor: '#007bff',
//                   color: '#fff',
//                   border: 'none',
//                   borderRadius: '5px',
//                   cursor: 'pointer',
//                   boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
//                   transition: 'transform 0.2s',
//                 }}
//                 onMouseOver={(e) => (e.target.style.transform = 'scale(1.05)')}
//                 onMouseOut={(e) => (e.target.style.transform = 'scale(1)')}
//               >
//                 Get Directions
//               </button>
//             </div>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default FoodBankList;





import React from 'react';

const FoodBankList = ({ foodBanks, onSelect, getDirections }) => {
  return (
    <div style={{ padding: '1rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#333' }}>Food Banks</h2>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {foodBanks.map((foodBank, index) => (
          <li
            key={index}
            style={{
              marginBottom: '1rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '1rem',
              backgroundColor: '#fff',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div>
              <strong
                style={{ fontSize: '1.2rem', color: '#007bff', cursor: 'pointer' }}
                onClick={() => onSelect(foodBank)}
              >
                {foodBank.name}
              </strong>
              <p style={{ color: '#555', margin: '0.5rem 0' }}>{foodBank.address}</p>
              <button
                onClick={() => getDirections(foodBank)}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s',
                }}
                onMouseOver={(e) => (e.target.style.transform = 'scale(1.05)')}
                onMouseOut={(e) => (e.target.style.transform = 'scale(1)')}
              >
                Get Directions
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FoodBankList; 