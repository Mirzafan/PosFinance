<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
<<<<<<< HEAD
        $response = $this->get('/login');
=======
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get('/dashboard');
>>>>>>> ad50c2ed05146eb5f8fdd90f171f2f14b15e9506

        $response->assertStatus(200);
    }
}

