import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const PurchaseForm = () => {
  // Validation Schema
  const validationSchema = Yup.object({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    address1: Yup.string().required("Address line 1 is required"),
    address2: Yup.string(),
    postalCode: Yup.string()
      .required("Postal code is required")
      .matches(/^\d{5}(-\d{4})?$/, "Invalid postal code"),
  });

  // Initial Form Values
  const initialValues = {
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    postalCode: "",
  };

  // Submit Handler
  const handleSubmit = (values: any) => {
    alert(JSON.stringify(values, null, 2));
  };

  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="w-full max-w-lg  py-[5vw] ">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          <Form>
            {/* First Name */}
            <div className="mb-[3vw]">
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-[#07494E]"
              ></label>
              <Field
                type="text"
                id="firstName"
                name="firstName"
                placeholder="Enter your first name"
                className="text-[4vw] w-full mt-2 p-[4vw] border-2 border-[#07494E] rounded-lg focus:ring-4 focus:ring-[#07494E] text-[#07494E]"
              />
              <ErrorMessage
                name="firstName"
                component="div"
                className="text-sm text-red-600 mt-1"
              />
            </div>

            {/* Last Name */}
            <div className="mb-[3vw]">
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-[#07494E]"
              ></label>
              <Field
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Enter your last name"
                className="text-[4vw] w-full mt-2 p-[4vw] border-2 border-[#07494E] rounded-lg focus:ring-4 focus:ring-[#07494E] text-[#07494E]"
              />
              <ErrorMessage
                name="lastName"
                component="div"
                className="text-sm text-red-600 mt-1"
              />
            </div>

            {/* Address Line 1 */}
            <div className="mb-[3vw]">
              <label
                htmlFor="address1"
                className="block text-sm font-medium text-[#07494E]"
              ></label>
              <Field
                type="text"
                id="address1"
                name="address1"
                placeholder="Enter your address"
                className="text-[4vw] w-full mt-2 p-[4vw] border-2 border-[#07494E] rounded-lg focus:ring-4 focus:ring-[#07494E] text-[#07494E]"
              />
              <ErrorMessage
                name="address1"
                component="div"
                className="text-sm text-red-600 mt-1"
              />
            </div>

            {/* Address Line 2 */}
            <div className="mb-[3vw]">
              <label
                htmlFor="address2"
                className="block text-sm font-medium text-[#07494E]"
              ></label>
              <Field
                type="text"
                id="address2"
                name="address2"
                placeholder="Enter your address (optional)"
                className="text-[4vw] w-full mt-2 p-[4vw] border-2 border-[#07494E] rounded-lg focus:ring-4 focus:ring-[#07494E] text-[#07494E]"
              />
            </div>

            {/* Postal Code */}
            <div className="mb-[3vw]">
              <label
                htmlFor="postalCode"
                className="block text-sm font-medium text-[#07494E]"
              ></label>
              <Field
                type="text"
                id="postalCode"
                name="postalCode"
                placeholder="Enter your postal code"
                className="text-[4vw] w-full mt-2 p-[4vw] border-2 border-[#07494E] rounded-lg focus:ring-4 focus:ring-[#07494E] text-[#07494E]"
              />
              <ErrorMessage
                name="postalCode"
                component="div"
                className="text-sm text-red-600 mt-1"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#07494E] text-white py-[4vw] px-[2vw] mt-[12vw] rounded-lg hover:bg-[#07494ebd] transition"
            >
              PAY WITH 2.0 WLD
            </button>
          </Form>
        </Formik>
      </div>
    </div>
  );
};

export default PurchaseForm;
