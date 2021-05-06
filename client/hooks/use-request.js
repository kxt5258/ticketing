import axios from 'axios';
import { useState } from 'react';
import React from 'react';

const useRequest = ({ url, method, body }) => {
  const [errors, setErrors] = useState(null);

  const doRequest = async () => {
    try {
      setErrors(null);
      const response = await axios[method](url, body);

      return response.data;
    } catch (err) {
      setErrors(
        <div className='alert alert-danger'>
          <h4>Opps...</h4>
          <ul className='my-0'>
            {err.response.data.errors.map((e) => {
              return <li>{e.message}</li>;
            })}
          </ul>
        </div>,
      );
    }
  };

  return { doRequest, errors };
};

export default useRequest;