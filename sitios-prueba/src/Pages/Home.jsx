import { useNavigate } from 'react-router-dom';
import { Site } from '../components/Home/Site';
import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { getWebsitesStatus } from '../services/samples';

const sites = [
  {
    name: 'Car Rental',
    url: '/car_rental',
  },
  {
    name: 'Roomio',
    url: '/roomio',
  },
  {
    name: 'EBook',
    url: '/ebook',
  },
  {
    name: 'Air somewhere',
    url: '/check_in',
  },
  {
    name: 'TuTicket',
    url: '/tuticket',
  },
];

export const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="w-1/2 my-8 mx-auto">
      <h1 className="text-3xl">Sitios de prueba</h1>
      <div className="my-8 border-b border-gray-300">
        {sites.map((site, i) => (
          <Site key={site.name} site={site} />
        ))}
      </div>
    </div>
  );
};
