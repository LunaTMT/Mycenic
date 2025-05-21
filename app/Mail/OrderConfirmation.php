<?php

namespace App\Mail;

use Illuminate\Support\Facades\Log;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public $order;

    /**
     * Create a new message instance.
     *
     * @param  Order  $order
     * @return void
     */
    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        Log::info('Building order confirmation email.', [
            'order' => $this->order->toArray(),
        ]);

        return $this->view('emails.order_confirmation')
                    ->with([
                        'order' => $this->order,
                    ]);
    }

}
