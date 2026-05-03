// File: fontend/src/components/modals/CurrencyModal.tsx

'use client';

import { Check, X } from 'lucide-react';

interface CurrencyOption {
	code: string;
	label: string;
	symbol: string;
}

interface CurrencyModalProps {
	isOpen: boolean;
	onClose: () => void;
	selectedCurrency: string;
	onCurrencyChange: (currency: string) => void;
}

const CURRENCIES: CurrencyOption[] = [
	{ code: 'VND', label: 'Viet Nam Dong', symbol: '₫' },
	{ code: 'USD', label: 'US Dollar', symbol: '$' },
	{ code: 'EUR', label: 'Euro', symbol: '€' },
];

export default function CurrencyModal({
	isOpen,
	onClose,
	selectedCurrency,
	onCurrencyChange,
}: CurrencyModalProps) {
	if (!isOpen) return null;

	const handleSelect = (currency: string) => {
		onCurrencyChange(currency);
		onClose();
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
			onClick={onClose}
		>
			<div
				className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between p-5 border-b">
					<h2 className="text-lg font-semibold">Chon tien te</h2>
					<button onClick={onClose} className="text-gray-500 hover:text-gray-700">
						<X className="w-5 h-5" />
					</button>
				</div>

				<div className="p-5 space-y-3">
					{CURRENCIES.map((currency) => (
						<button
							key={currency.code}
							onClick={() => handleSelect(currency.code)}
							className="w-full flex items-center justify-between rounded-xl border px-4 py-3 text-left hover:border-pink-500 hover:bg-pink-50 transition"
						>
							<div className="flex items-center gap-3">
								<span className="text-lg font-semibold">{currency.symbol}</span>
								<div>
									<div className="font-medium">{currency.code}</div>
									<div className="text-sm text-gray-500">{currency.label}</div>
								</div>
							</div>
							{selectedCurrency === currency.code && (
								<Check className="w-5 h-5 text-pink-600" />
							)}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
