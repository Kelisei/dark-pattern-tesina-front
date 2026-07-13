import { useTranslation } from 'react-i18next';
import confirmation from '../assets/CarRental/confirmation.png';

export const Confirmation = () => {
  const { t } = useTranslation();
  const closeTab = () => {
    window.location.href = '/';
  };
  return (
    <div className="w-full mx-auto text-center">
      <img className="w-48 mx-auto my-4" src={confirmation} />
      <button
        className="bg-green-700 hover:bg-green-600 text-white font-bold py-6 px-10 rounded-full text-center text-xl"
        onClick={closeTab}
      >
        {t('Rental.Review.Confirmation.Close')}
      </button>
    </div>
  );
};
