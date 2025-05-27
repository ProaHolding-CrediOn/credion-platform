import { useEffect } from 'react';
import FieldRenderer from './FieldRenderer';

const FormBlock = ({ block, currentStep, setCurrentStep, values, setValues }: any) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{block.label}</h2>
      {block.fields.map((field: any) => (
        <FieldRenderer
          key={field.name}
          field={field}
          value={values[field.name]}
          onChange={(val: any) => setValues({ ...values, [field.name]: val })}
        />
      ))}
      {/* Botones siguiente/anterior */}
      <div className="flex justify-between mt-4">
        {currentStep > 0 && (
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            Atrás
          </button>
        )}
        <button
          onClick={() => setCurrentStep(currentStep + 1)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default FormBlock;
